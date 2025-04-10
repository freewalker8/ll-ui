/*
 * @Author: lianglei stone.ll@qq.com
 * @Date: 2022-02-17 10:22:05
 * @LastEditors: lianglei stone.ll@qq.com
 * @LastEditTime: 2025-04-09 10:19:57
 * @FilePath: \ll-form-table\src\packages\index.js
 * @Description: 组件导出
 */
import { LlForm, addUIType, addUITypes, UITypes } from './form';
import { default as validator, registerValidateType, registerValidateTypes } from './form/utils/validator';

import { LlTable, LlTableStatic, setProps as setTableProps, install as useTable } from './table';

// eslint-disable-next-line no-undef
const version = _VERSION_;

function install(...args) {
  LlForm.install(...args);
  LlTable.install(...args);
  LlTableStatic.install(...args);
}

export {
  version,
  // 表单导出
  LlForm,
  addUIType,
  addUITypes,
  UITypes,
  validator,
  registerValidateType,
  registerValidateTypes,
  // 表格导出
  useTable,
  LlTable,
  LlTableStatic,
  setTableProps
};

export default {
  version,
  install,
  // 表单导出
  LlForm,
  addUIType,
  addUITypes,
  UITypes,
  validator,
  registerValidateType,
  registerValidateTypes,
  // 表格导出
  useTable,
  LlTable,
  LlTableStatic,
  setTableProps
};
