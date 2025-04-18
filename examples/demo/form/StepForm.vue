<template>
  <ll-form
    :step="true"
    :step-attrs="stepAttrs"
    :steps-position="'top'"
    :active-step="0"
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
      // el-steps的属性配置
      stepAttrs: {
        space: '100%',
        direction: 'horizontal',
        active: 0, // 优先级高于组件属性active-step配置
        finishStatus: 'success'
      },
      formItems: [
        {
          type: 'step',
          title: '基础信息',
          icon: 'el-icon-edit',
          description: '用户基础ixnx',
          children: [
            { type: 'input', label: '账号', prop: 'account' },
            {
              type: 'input',
              label: '昵称',
              prop: 'nickname',
              tips: '请输入昵称'
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
            }
          ]
        },
        {
          type: 'step',
          title: '教育信息',
          icon: '',
          description: '教育经历',
          children: [
            {
              type: 'input',
              label: '高中',
              prop: 'edu.highSchool',
              formElementProps: {
                placeholder: '高中'
              }
            },
            {
              type: 'input',
              label: '大学',
              prop: 'edu.university',
              formElementProps: {
                placeholder: '大学'
              }
            }
          ]
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
