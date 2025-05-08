import { setProps } from './config';
import LlTable from './components/Table';
import LlTableStatic from './components/TableStatic';

LlTable.install = function(Vue, options) {
  setProps(options, true);
  Vue.component(LlTable.name, LlTable);
};

LlTable.setProps = setProps;

LlTableStatic.install = function(Vue, options) {
  setProps(options, true);
  Vue.component(LlTableStatic.name, LlTableStatic);
};

LlTableStatic.setProps = setProps;

// 插件化注册
const install = function(...args) {
  LlTable.install(...args);
  LlTableStatic.install(...args);
};

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

export { install, LlTable, LlTableStatic, setProps };

export default {
  install
};
