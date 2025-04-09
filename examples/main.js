/*
 * @Author: lianglei stone.ll@qq.com
 * @Date: 2022-02-17 10:22:05
 * @LastEditors: lianglei stone.ll@qq.com
 * @LastEditTime: 2025-04-09 11:03:41
 * @FilePath: \ll-ui\examples\main.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import Vue from 'vue';
import ElementUI from 'element-ui';
import App from './App.vue';
import Router from './router';
import CustomInput from './components/CustomInput.vue';
import {
  LlForm,
  addUIType,
  addUITypes,
  UITypes,
  registerValidateType,
  useTable
} from '../src/packages/index';

import 'normalize.css';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI);
Vue.use(LlForm);
Vue.use(useTable);
Vue.component('custom-input', CustomInput);
Vue.config.productionTip = false;

const reg_rule_strong = /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/;
registerValidateType('strong', reg_rule_strong, '只能输入中文、英文、数字、下划线');

addUIType('customInput', (h, dataObj) => <custom-input {...dataObj} />);

addUITypes([
  {
    uiType: 'customInput2',
    render: (h, dataObj) => <custom-input {...dataObj} />
  }
]);

console.log('UITypes', UITypes);

new Vue({
  render: h => h(App),
  router: Router
}).$mount('#app');
