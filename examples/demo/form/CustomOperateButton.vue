<template>
  <div class="ll-form-warp">
    <ll-form
      :lodding="formLoading"
      :form-items="formItems"
      :rules="rules"
      :model="formData"
      :gutter="20"
      :layout="'form,operate'"
      button-position="center"
      :submit-button-attrs="{ size: 'mini', type: 'success' }"
    >
      <!-- 自己实现表单提交按钮和操作 -->
      <template #operate slot-scope="{ resetForm, formData, validateForm }">
        <div style="text-align: center">
          <el-button @click="resetForm">Reset</el-button>
          <el-button type="primary" :loading="formLoading" @click="handlerSubmit(formData, validateForm)">Ok</el-button>
        </div>
      </template>
    </ll-form>  
  </div>
</template>

<script>
export default {
  name: 'CustomOperateButton',
  data() {
    return {
      formLoading: false,
      formData: {
        name: '',
        age: '',
      },
      formItems: [
        { type: 'input', label: '姓名', prop: 'name', span: 12 },
        { type: 'inputNumber', label: '年龄', prop: 'age', span: 12, formElementProps: { min: 0, max: 200, placeholer: '请输入年龄' } },
      ],
      rules: {
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ],
        age: [
          { required: true, message: '请输入年龄', trigger: 'blur' }
        ]
      }
    };
  },
  methods: {
    handerSubmit(formData, validateForm) {
      validateForm((valid) => {
        if (!valid) {
          return;
        }
        console.log('formData', formData);
        this.formLoading = true;
        setTimeout(() => {
          this.formLoading = false;
          this.$message.success('提交成功');
        }, 1500);
      });
    }
  }
}
</script>