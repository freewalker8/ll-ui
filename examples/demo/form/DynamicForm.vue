<template>
  <div class="ll-form-warp">
    <h3>动态增减表单项</h3>
    <ll-form
      :loading="formLoading"
      :form-items="formItems"
      :rules="rules"
      :model="formData"
      :post-data="submitForm"
      button-position="center"
      label-width="100px"
    ></ll-form>
    <h3>表单项是否展示依赖其它表单项的值，通过配置display属性来控制表单项的展示</h3>
    <ll-form
      :form-items="formItemsEffect"
      :rules="rules"
      :model="formDataEffect"
      :post-data="submitForm"
      label-width="100px"
    ></ll-form>
    <h3>表单项是否展示依赖其它表单项的值，动态的修改formItems属性的绑定值来控制表单项的展示</h3>
    <p>原理：通过监听表单项的值来动态的增减表单配置项，示例这里监听formDataEffect2.age，填写了年龄后就增加填写电话的表单项，反之删除该项</p>
    <ll-form
      :form-items="formItemsEffect2"
      :model="formDataEffect2"
      :post-data="submitForm"
      button-position="right"
      label-width="100px"
    ></ll-form>
  </div>
</template>

<script>
export default {
  name: 'DynamicForm',
  data() {
    return {
      formLoading: false,
      postUrl: window.location.origin + '/postFormData',
      favCount: 1,
      formData: {
        name: '',
        favs: [],
      },
      formItems: [
        { type: 'input', label: '姓名', prop: 'name' },
        { type: 'input', label: '爱好', prop: 'fav1', render: h => {
          return (
            <div>
              <el-input vModel={this.formData.favs[0]}></el-input>
              <el-button
                {...{
                  on: { click: this.addFav },
                  props: { size: 'mini', type: 'primary' }
                }}
              >新增</el-button>
            </div>
          );
        } },
      ],
      rules: {
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ]
      },
      formDataEffect: {
        name: '',
        favs: '',
      },
      formItemsEffect: [
        { type: 'input', label: '姓名', prop: 'name', formElementProps: { placeholder: '填写了姓名后填写爱好的表单项会展示出来' } },
        { type: 'input', label: '爱好', prop: 'fav', display: formData => !!formData.name },
      ],
      formDataEffect2: {
        name: '',
        age: '',
        phone: ''
      },
      formItemsEffect2: [
        { type: 'input', label: '姓名', prop: 'name' },
        { type: 'input', label: '年龄', prop: 'age', formElementProps: { placeholder: '填写了年龄后会要求填写电话' } },
      ],
    };
  },
  watch: {
    'formDataEffect2.age': {
      handler(val) {
        const { formItemsEffect2 } = this;
        // 填写了年龄，增减填写电话的表单项
        if (val) {
          formItemsEffect2.splice(2, 0, { type: 'input', label: '电话', prop: 'phone' });
        } else {
          formItemsEffect2.forEach(({ prop }, index) => {
            if ('phone' === prop) {
              formItemsEffect2.splice(index, 1);
              return;
            }
          });
        }
      },
    }
  },
  methods: {
    submitForm(formData) {
      console.log('formData', formData);
      this.formLoading = true;
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          this.formLoading = false;
          this.$message.success('提交成功');
          resolve('success');
        }, 1500);
      });
    },
    addFav() {
      this.favCount++;
      const prop = `fav${this.favCount}`;
      const formItem = {
        type: 'input', 
        label: `爱好${this.favCount}`, 
        prop,
        render: h => {
          return (
            <div>
              <el-input vModel={this.formData.favs[this.favCount - 1]}></el-input>
              <el-button
                {...{
                  on: { click: () => { this.deleteFav(prop) } },
                  props: { size: 'mini', type: 'danger' }
                }}
              >删除</el-button>
            </div>
          );
        }
      };

      this.formItems.push(formItem);
    },
    deleteFav(prop) {
      this.formItems.forEach((item, index) => {
        if (item.prop === prop) {
          item.formItem.splice(index, 1);
          return;
        }
      });
    }
  }
}
</script>