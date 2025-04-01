import Vue from 'vue';
import VueRouter from 'vue-router';

import FormDemo from './demo/form/FormDemo.vue';
import CustomOperateButtonDemo from './demo/form/CustomOperateButtonDemo.vue';
import DynamicFormDemo from './demo/form/DynamicFormDemo.vue';

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