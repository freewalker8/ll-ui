/*
 * @Author: lianglei stone.ll@qq.com
 * @Date: 2022-02-17 10:22:05
 * @LastEditors: lianglei stone.ll@qq.com
 * @LastEditTime: 2025-04-02 10:43:05
 * @FilePath: \ll-ui\src\packages\form\index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import LlForm from './components/Form';
import extendUITypes from './utils/extendUITypes';

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
  if (!extendUITypes[uiType]) {
    extendUITypes[uiType] = render;
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
