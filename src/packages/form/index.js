/*
 * @Author: lianglei stone.ll@qq.com
 * @Date: 2022-02-17 10:22:05
 * @LastEditors: lianglei stone.ll@qq.com
 * @LastEditTime: 2025-04-02 10:43:05
 * @FilePath: \ll-form-table\src\packages\form\index.js
 * @Description: 表单导出
 */
import LlForm from './components/Form';
import extendUITypeMap from './utils/extendUITypeMap';

LlForm.install = function(Vue) {
  Vue.component(LlForm.name, LlForm);
};

const UITypes = [
  'input',
  'inputNumber',
  'textarea',
  'select',
  'switch',
  'radio',
  'radioGroup',
  'radioButtonGroup',
  'checkbox',
  'checkboxGroup',
  'checkboxButtonGroup',
  'cascader',
  'slider',
  'timeSelect',
  'timeRangePicker',
  'datePicker',
  'datesPicker',
  'yearPicker',
  'monthPicker',
  'weekPicker',
  'monthRangePicker',
  'dateRangePicker',
  'dateTimePicker',
  'dateTimeRangePicker',
  'upload',
  'rate',
  'colorPicker',
  'transfer',
  'dialog'
];

/**
 * 为表单添加表单项UI类型
 * @param {String} uiType UI类型
 * @param {Function} render UI类型实现，渲染函数
 */
const addUIType = (uiType, render) => {
  if (!extendUITypeMap[uiType]) {
    extendUITypeMap[uiType] = render;
    UITypes.push(uiType);
  } else {
    console.warn(`[ll-form]:表单类型${uiType}已经存在`);
  }
};

/**
 * 批量添加表单项UI类型
 * @param {Array<{ uiType: String, render: Function }>} uiTypes
 */
const addUITypes = uiTypes => {
  uiTypes.forEach(({ uiType, render }) => {
    addUIType(uiType, render);
  });
};

export { LlForm, addUIType, addUITypes, UITypes };

export default LlForm;
