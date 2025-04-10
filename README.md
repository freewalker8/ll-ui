# ll-form-table

基于vue2.6和element-ui的组件库，提供表单组件、表格组件。

以数据驱动视图，将表单、表格由`template`语法转换成`json`语法。通过json配置模板，快速完成表单、表格的开发。

## 本地开发

node版本要求：

node >= 12.0.0 && node <= 14.0.0

### 安装依赖

```
npm install
```

### 运行示例
```
npm run serve
```

## 使用

### 安装

```
npm install ll-form-table
```

### 使用方法

```js
import Vue from 'vue';
import LlUI, { LlFrom, LlTable, LlTableStatic, useTable } from 'll-form-table';

// 全局注册表单
Vue.use(LlForm);

// 全局注册表格
Vue.use(LlTable);
Vue.use(LlTableStatic);

// 当同时注册LlTable和LlTableStatic时，可以使用useTable快捷注册这两个组件
Vue.use(useTable);

// 全部注册
Vue.use(LlUI);
```

### 示例

```html
<template>
  <ll-form
    :form-items="formItems"
    :model="formData"
    :rules="rules"
    :post-data="submitForm"
    button-position="center"
    label-width="100px"
  ></ll-form>
</template>

<script>
  import { LlForm } from 'll-form-table';
  export default {
    name: 'FormDemo',
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
              width: 200,
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
```

示例渲染结果如下所示：

![simple-form-demo](./docs/img/simple-form-demo.png)

