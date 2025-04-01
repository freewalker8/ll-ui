import Vue from "vue";
import ElementUI from "element-ui";
import App from "./App.vue";
import Router from './router';
import CustomInput from './components/CustomInput.vue';
import { LlForm, addUIType, addUITypes, UITypes, registerValidateType, rule_strong } from '../packages/index';

import 'normalize.css';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI);
Vue.use(LlForm);
Vue.component('custom-input', CustomInput);
Vue.config.productionTip = false;

registerValidateType('strong', rule_strong);

addUIType('customInput', (h, dataObj) => (<custom-input {...dataObj} />));

addUITypes([
  {
    uiType: 'customInput2',
    render: (h, dataObj) => (<custom-input {...dataObj} />)
  }
]);

console.log('UITypes', UITypes);

new Vue({
  render: h => h(App)
}).$mount("#app");
