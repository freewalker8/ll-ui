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
  name: 'GroupForm',
  components: { LlForm },
  data() {
    return {
      formItems: [
        { type: 'input', label: '账号', prop: 'account' },
        {
          type: 'inputNumber',
          label: '年龄',
          prop: 'age',
          formElementProps: {
            min: 1,
            max: 200,
            step: 1,
            placeholder: '年龄'
          }
        },
        {
          label: '嵌套教育信息',
          prop: 'edu',
          render: () => {
            const items = [
              {
                type: 'input',
                label: '高中',
                prop: 'highSchool',
                formElementProps: {
                  placeholder: '高中'
                }
              },
              {
                type: 'input',
                label: '大学',
                prop: 'university',
                formElementProps: {
                  placeholder: '大学'
                }
              }
            ];

            return (
              <div>
                <br />
                <ll-form
                  {...{
                    props: {
                      formItems: items
                    },
                    attrs: {
                      model: this.subFormData
                    },
                    on: {
                      submit: this.submitSubForm
                    }
                  }}></ll-form>
              </div>
            );
          }
        }
      ],
      formData: {
        account: 'stone',
        age: 18
      },
      subFormData: {
        highSchool: '',
        university: ''
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
        ]
      },
      formLoading: false
    };
  },
  methods: {
    submitSubForm(formData) {
      debugger;
      console.log('sub formData', formData);
      this.formLoading = true;
      return new Promise(resolve => {
        setTimeout(() => {
          this.formLoading = false;
          this.$message.success('提交子表单数据成功');
          resolve('success');
        }, 1500);
      });
    },
    submitForm(formData) {
      console.log('formData', formData);
      this.formLoading = true;
      return new Promise(resolve => {
        setTimeout(() => {
          this.formLoading = false;
          this.$message.success('提交父表单数据成功');
          resolve('success');
        }, 1500);
      });
    }
  }
};
</script>
