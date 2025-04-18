<template>
  <ll-form
    :form-items="formItems"
    :model="formData"
    :rules="rules"
    :post-data="submitForm"
    button-position="center"
    label-width="100px"
    class="ll-form-warp"
  ></ll-form>
</template>

<script>
import { LlForm } from 'll-form-table';
export default {
  name: 'SimpleDemo',
  components: { LlForm },
  data() {
    return {
      formItems: [
        { type: 'input', label: '账号', prop: 'account' },
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
          type: 'inputNumber',
          label: '年龄',
          prop: 'age',
          formElementProps: {
            // width: 200,
            min: 1,
            max: 200,
            step: 1,
            placeholder: '年龄'
          }
        },
        {
          type: 'select',
          label: '头衔',
          prop: 'title',
          formElementProps: {
            placeholder: '头衔',
            options: [
              { label: 'Tester', value: '3' },
              { label: 'Java developer', value: '2' },
              { label: 'Web Developer', value: '1' }
            ],
            loading: false,
            filterable: true,
            multiple: true
          }
        },
        {
          type: 'input',
          prop: 'edu.highSchool',
          label: '高中'
        },
        {
          type: 'input',
          prop: 'edu.university',
          label: '大学'
        },
        {
          type: 'input',
          label: '数组绑定',
          prop: 'arr.0.value',
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
        }
      ],
      formData: {
        account: 'stone',
        nickname: 'stone',
        age: 18,
        title: [],
        edu: {
          highSchool: '',
          university: ''
        },
        arr: [{ value: '数组绑定值' }]
      },
      rules: {
        account: [
          { required: true, message: '请输入账号', trigger: 'blur' },
          {
            trigger: 'change',
            validator: (rule, value, callback) => {
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
          { min: 3, message: '昵称长度至少为3个字符', trigger: 'change' }
        ]
      },
      formLoading: false
    };
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
    }
  }
};
</script>
