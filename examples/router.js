/*
 * @Author: lianglei stone.ll@qq.com
 * @Date: 2025-04-01 17:22:01
 * @LastEditors: lianglei stone.ll@qq.com
 * @LastEditTime: 2025-04-09 14:31:03
 * @FilePath: \ll-ui\examples\router.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: '/form/demo'
  },
  {
    path: '/form/demo',
    component: () => import('./demo/form/FormDemo.vue')
  },
  {
    path: '/form/simple-demo',
    component: () => import('./demo/form/SimpleDemo.vue')
  },
  {
    path: '/form/custom-operate-button',
    component: () => import('./demo/form/CustomOperateButton.vue')
  },
  {
    path: '/form/dynamic-form',
    component: () => import('./demo/form/DynamicForm.vue')
  },
  // 表格
  {
    path: '/table/table-static',
    component: () => import('./demo/table/TableStatic.vue')
  }
];

export default new VueRouter({
  mode: 'hash',
  routes
});
