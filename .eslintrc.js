/*
 * @Author: lianglei stone.ll@qq.com
 * @Date: 2022-02-17 10:22:05
 * @LastEditors: lianglei stone.ll@qq.com
 * @LastEditTime: 2025-04-09 10:56:09
 * @FilePath: \ll-form-table\.eslintrc.js
 * @Description: eslist配置
 */
module.exports = {
  root: true,

  env: {
    node: true
  },

  extends: ["plugin:vue/recommended", "eslint:recommended", "@vue/prettier"],

  parserOptions: {
    parser: "babel-eslint"
  },

  rules: {
    "no-console": "off",
    "no-debugger": process.env.NODE_ENV === 'production' ? 'error' : 'off',
    "no-unused-vars": "off",
    "vue/require-default-prop": "off"
  },

  overrides: [
    {
      files: '.prettierrc.js'
    }
  ]
};
