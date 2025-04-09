import { setProps } from './config';
import LlTable from './components/Table';
import LlTableStatic from './components/TableStatic';

LlTable.install = function(Vue, options) {
  setProps(options, true);
  Vue.component(LlTable.name, LlTable);
};

LlTableStatic.install = function(Vue, options) {
  setProps(options, true);
  Vue.component(LlTableStatic.name, LlTableStatic);
};

// 插件化注册
const install = function(...args) {
  LlTable.install(...args);
  LlTableStatic.install(...args);
};

export { install, LlTable, LlTableStatic, setProps };

export default {
  install
};
