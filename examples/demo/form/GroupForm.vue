<template>
  <ll-form
    :form-items="formItems"
    :model="formData"
    :rules="rules"
    :post-data="submitForm"
    :show-label="false"
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
          type: 'group',
          label: '教育信息',
          prop: 'edu',
          children: [
            {
              type: 'input',
              prop: 'edu.highSchool',
              label: '高中'
            },
            {
              type: 'input',
              prop: 'edu.university',
              label: '大学'
            }
          ]
        }
      ],
      formData: {
        account: 'stone',
        age: 18,
        edu: {
          highSchool: '',
          university: ''
        }
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
