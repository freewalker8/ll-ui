<template>
  <div class="ll-form-warp">
    <h3>表单综合示例</h3>
    <ll-form
      ref="form"
      :loading="formLoading"
      :form-items="formItems"
      :rules="rules"
      :model="formData"
      :post-data="submitForm"
      :unsubmit-unchanged-field="false"
      :unsubmit-disabled-field="true"
      :submit-button-enabled="false"
      :clearable="true"
      :tips-effect="'light'"
      :submit-button-attrs="{ size: 'mini', type: 'success' }"
      mode="edit"
      button-position="center"
      label-width="100px"
      @submit="handlerSubmit"
    >
      <el-col :span="12">
        <el-form-item prop="workAge" label="工龄">
          <el-input v-model.number="formData.workAge" type="small"></el-input>
        </el-form-item>
      </el-col>
    </ll-form>
  </div>
</template>

<script>
export default {
  name: 'FormDemo',
  data() {
    const generateData = () => {
      const data = [];
      const cities = ['上海', '北京', '广州', '深圳', '杭州', '南京', '成都'];
      const pinyin = ['shanghai', 'beijing', 'guangzhou', 'shenzhen', 'hangzhou', 'nanjing', 'chengdu'];

      cities.forEach((city, index) => {
        data.push({
          key: index,
          label: city,
          value: pinyin[index]
        });
      });
      return data;
    };

    return {
      formLoading: false,
      formItems: [
        {
          type: 'input',
          label: '数组绑定',
          prop: 'arr.0.value',
          order: 3,
          style: { color: 'red' },
          formElementProps: {
            on: {
              change: val => {
                this.$message.success(`value change:${val}`);
              },
              focus: e => {
                console.log('focus event', e);
                this.$message.success('input focus');
              }
            }
          }
        },
        {
          // 通过render和viewRender自定义表单项
          label: 'nickname',
          // labelRender优先级高于label
          labelRender: () => {
            return <span>昵称</span>;
          },
          // prop: 'nickname',
          tips: '请输入昵称',
          render: () => {
            return (
              <el-input
                type='text'
                placeholder='昵称'
                size='small'
                {...{
                  props: {
                    value: this.formData.nickname
                  },
                  on: {
                    input: val => {
                      this.formData.nickname = val;
                    }
                  }
                }}></el-input>
            );
          },
          // viewRender优先级大于this.model[prop]
          viewRender: () => <span>{this.formData.nickname}</span>
        },
        {
          type: 'customInput',
          label: 'customInput',
          prop: 'name',
          tips: 'customInput',
          fetchData: () => {
            return new Promise(resolve => {
              setTimeout(() => {
                resolve('async data');
              }, 2000);
            });
          },
          formElementProps: {
            placeholder: '请输入姓名',
            clearable: true,
            on: {
              focus: e => {
                console.log('customInput focus', e);
                this.$message.info('customInput focus');
              },
              change: val => {
                this.$message.success('customInput change', val);
              }
            },
            nativeOn: {
              click: () => {
                this.$message.info('customInput click');
              }
            }
          }
        },
        {
          type: 'inputNumber',
          label: '年龄',
          prop: 'age',
          formElementProps: {
            width: 200,
            min: 1,
            max: 200,
            step: 1,
            placeholder: '年龄'
          }
        },
        {
          type: 'select',
          label: '职位',
          prop: 'role',
          effect: ['level'],
          // 动态获取options
          // fetchOptions: () => {
          //   return new Promise((resolve) => {
          //     setTimeout(() => {
          //       return resolve([
          //         { label: 'Tester', value: '3' },
          //         { label: 'Java developer', value: '2' },
          //         { label: 'Web Developer', value: '1' },
          //         { label: 'UI', value: '0' },
          //       ]);
          //     }, 2000);
          //   });
          // },
          formElementProps: {
            placeholder: '职位',
            options: [
              { label: 'Tester', value: '3' },
              { label: 'Java developer', value: '2' },
              { label: 'Web Developer', value: '1' },
              { label: 'UI', value: '0' }
            ],
            loading: false,
            filterable: true,
            multiple: false,
            // 支持远程搜索
            remote: true,
            remoteMethod: query => {
              console.log('remoteMethod', query);
              return new Promise(resolve => {
                setTimeout(() => {
                  resolve([
                    { label: 'Tester', value: '3' },
                    { label: 'Java developer', value: '2' },
                    { label: 'Web Developer', value: '1' },
                    { label: 'UI', value: '0' }
                  ]);
                }, 2000);
              });
            },
            on: {
              change: v => {
                console.log('select change', v);
              }
            }
          }
        },
        {
          type: 'select',
          label: '职级',
          prop: 'level',
          span: 12,
          fetchOptions: () => {
            return new Promise(resolve => {
              setTimeout(() => {
                return resolve([
                  { label: 'Level3', value: '3' },
                  { label: 'Level2', value: '2' },
                  { label: 'Level1', value: '1' },
                  { label: 'Level0', value: '0' }
                ]);
              }, 2000);
            });
          },
          formElementProps: {
            placeholder: '职级',
            options: [], // init options, nessessary
            class: 'customClassLevel'
          }
        },
        {
          type: 'select',
          label: '头衔',
          prop: 'title',
          span: 12,
          formElementProps: {
            placeholder: '头衔',
            options: [
              {
                label: '工程师',
                children: [
                  { label: 'Tester', value: '3' },
                  { label: 'Java developer', value: '2' },
                  { label: 'Web Developer', value: '1' }
                ]
              }
            ],
            loading: false,
            filterable: true,
            multiple: true
          }
        },
        {
          type: 'upload',
          label: '头像',
          prop: 'avatar',
          span: 24,
          formElementProps: {
            multiple: true,
            autoUpload: false,
            getUploadResponseValue: response => {
              console.log('getUploadResponseValue', response);
              return response.data;
            },
            viewBigPic: true, // 点击缩略图，支持查看大图，扩展属性
            thumbWidth: 200, // 缩略图宽度，扩展属性
            thumbHeight: 200, // 缩略图高度，扩展属性
            uploadText: '上传头像', // 上传按钮文案,扩展属性
            // 扩展属性，设置tip slot的内容，提示说明文字
            tip: <div class='el-upload__tip ll-el-upload__tip'>只能上传jpg/png格式的图片</div>,
            // 扩展属性，设置trigger slot的内容，自定义触发文件上传的按钮，设置了trigger后，uploadText将失效
            trigger: (
              <el-button type='primary' size='small'>
                Upload
              </el-button>
            ),
            // 自己的onChange事件响应，组件默认对change进行了响应，绑定了值到表单；这里还可以自己响应change事件，做一些事情
            onChange: function(file, fileList) {
              console.log('on change', file, fileList);
            },
            onRemove: function(file, fileList) {
              console.log('on remove', file, fileList);
            },
            accept: '.jpg,.png,.jpeg',
            action: ''
          }
        },
        {
          type: 'checkbox',
          label: '是否同意',
          prop: 'agree',
          span: 12,
          formElementProps: { label: '是否同意' }
        },
        {
          type: 'checkboxGroup',
          label: '开通城市',
          prop: 'city',
          span: 12,
          formElementProps: {
            min: 1,
            options: [
              { label: '北京', value: 'beijing' },
              { label: '上海', value: 'shanghai' },
              { label: '广州', value: 'guangzhou' },
              { label: '成都', value: 'chengdu' }
            ]
          }
        },
        {
          type: 'radioButtonGroup',
          label: '交通工具',
          prop: 'transportation',
          span: 12,
          formElementProps: {
            options: [
              { label: '飞机', value: 'plane' },
              { label: '火车', value: 'train' },
              { label: '汽车', value: 'car' },
              { label: '船', value: 'ship' }
            ]
          }
        },
        {
          type: 'switch',
          label: '开关',
          prop: 'switcher',
          span: 12,
          formElementProps: {
            label: '开关',
            activeColor: '#13ce66',
            inactiveColor: '#ff4949'
          }
        },
        { type: 'slider', label: '进度', prop: 'progress', span: 24, formElementProps: { min: 10 } },
        {
          type: 'timeSelect',
          label: '时间',
          prop: 'time',
          span: 12,
          formElementProps: {
            clearable: false,
            pickOptions: { start: '08:30', end: '18:30', step: '00:15', format: 'HH:mm' }
          }
        },
        { type: 'timeRangePicker', label: '时间范围', prop: 'timeRange', span: 12 },
        { type: 'datePicker', label: '日期', prop: 'date', span: 12 },
        { type: 'dateRangePicker', label: '日期范围', prop: 'dateRange', span: 12 },
        { type: 'yearPicker', label: '年', prop: 'year', span: 12 },
        { type: 'monthPicker', label: '月', prop: 'month', span: 12 },
        { type: 'colorPicker', label: '喜欢的颜色', prop: 'color', span: 12 },
        { type: 'rate', label: '评分', prop: 'rate', span: 12, formElementProps: { showText: true } },
        {
          type: 'transfer',
          label: '穿梭框',
          prop: 'transfer',
          span: 24,
          formElementProps: { data: generateData() }
        }
      ],
      rules: {
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          {
            trigger: 'change',
            validator: function(rule, value, callback) {
              if (/^[a-zA-Z0]+$/.test(value)) {
                callback();
              } else {
                callback(new Error('只能输入字母，不能为空'));
              }
            }
          }
        ],
        nickname: [
          { required: true, message: '请输入昵称', trigger: 'change' },
          { type: 'strong', trigger: 'change' }
        ],
        dialog: [{ required: true, message: '请选择', trigger: 'change' }],
        age: [{ required: true, message: '请输入年龄', trigger: 'change' }],
        role: [{ required: true, message: '请选择角色', trigger: 'change' }],
        fav: [{ required: true, message: '请输入爱好', trigger: 'change' }]
      },
      formData: {
        arr: [{ value: '数组绑定值' }],
        name: 'stone',
        nickname: 'stone',
        age: 18,
        dialog: '弹框绑定内容',
        role: '',
        level: '',
        title: [],
        workAge: 11,
        fav: '',
        agree: true,
        city: ['chengdu'],
        transportation: 'car',
        swicher: true,
        progress: 80,
        time: '',
        timeRange: '',
        date: '',
        dateRange: '',
        year: '',
        month: '',
        rate: 5,
        slider: 50,
        color: '#ff0000',
        transfer: []
      },
      formItemsEffect: [
        {
          type: 'input',
          label: '姓名',
          prop: 'name',
          formElementProps: { placeholder: '填写了姓名后填写爱好的表单项会展示出来' }
        },
        { type: 'input', label: '爱好', prop: 'fav', display: formData => !!formData.name }
      ],
      formDataEffect2: {
        name: '',
        age: '',
        phone: ''
      },
      formItemsEffect2: [
        { type: 'input', label: '姓名', prop: 'name' },
        {
          type: 'input',
          label: '年龄',
          prop: 'age',
          formElementProps: { placeholder: '填写了年龄后会要求填写电话' }
        }
      ]
    };
  },
  created() {
    this.formItems.push({
      type: 'input',
      label: '爱好',
      prop: 'fav',
      span: 24,
      formElementProps: {
        type: 'textarea',
        placeholder: '请输入爱好'
      }
    });
    setTimeout(() => {
      console.log('get upload refs', this.$refs.form.getUploadRefs());
    }, 1000);
  },
  methods: {
    submitForm(formData) {
      console.log('formData', formData);
      this.formLoading = true;
      return new Promise(resolve => {
        setTimeout(() => {
          this.formLoading = false;
          this.$message.success('提交成功');
          resolve('success');
        }, 1500);
      });
    },
    handlerSubmit(formData) {
      console.log('onSubmit formData', formData);
      this.formLoading = true;
      setTimeout(() => {
        this.formLoading = false;
        this.$message.success('提交成功');
      }, 2000);
    }
  }
};
</script>

<style lang="scss">
.ll-form-warp {
  width: 800px;
  margin: 0 auto;
  .el-col-12 {
    height: 50px;
  }
}
</style>
