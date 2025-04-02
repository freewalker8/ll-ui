/*
 * @Author: lianglei stone.ll@qq.com
 * @Date: 2025-04-01 17:22:01
 * @LastEditors: lianglei stone.ll@qq.com
 * @LastEditTime: 2025-04-02 10:27:19
 * @FilePath: \ll-ui\examples\router.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import Vue from 'vue';
import VueRouter from 'vue-router';

import FormDemo from './demo/form/FormDemo.vue';
import CustomOperateButtonDemo from './demo/form/CustomOperateButton.vue';
import DynamicFormDemo from './demo/form/DynamicForm.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: '/form/demo'
  },
  {
    path: '/form/demo',
    component: FormDemo
  },
  {
    path: '/form/custom-operate-button',
    component: CustomOperateButtonDemo
  },
  {
    path: '/form/dynamic-form',
    component: DynamicFormDemo
  }
];

export default new VueRouter({
  mode: 'hash',
  routes
});
