import cloneDeep from 'lodash-es/cloneDeep';
import Render from '@/utils/render';
import { 
  delegate, 
  appendFormData, 
  isTypeOf, 
  isFunction, 
  isObject, 
  isArray, 
  isValueEqual,
  flattenFormItems, 
  sortObjectArrayByProp, 
  debounce, 
  getObjectPropVal, 
  getObjArrayItemByKeyValue, 
  getObjPropValByPath 
} from '@/utils/util';
import Bus from '@/utils/bus';
import FormItemTypeMap from '../mixins/FormItemTypeMap';
import StepForm from '../mixins/StepForm';
import extendUITypes from '../utils/extendUITypes';

import '../style/index.scss';

const UPDATE_OPENER_INPUT_EVENT = 'll-form:update-opener-input-value';
const ADD = 'add';
const EDIT = 'edit';
const VIEW = 'view';
const JSON_DATA = 'json';
const FORMDATA = 'formData';

/**
 * 保留正确的表单项配置，过滤掉无意义的表单项配置（null, '', undefined, 空对象{}）,适配三元表达式判断是否增加表单项的情形
 * @param {FOrmItem} formItem 表单项配置对象
 * @returns {Boolean} true: 有效表单配置项，false：无效表单配置项
 */
export function filterUseableFormItem(formItem) {
  return formItem && Object.keys(formItem).length > 0;
}

window.llFormSetValue = function (value) {
  const inputId = window.sessionStorage.getItem('ll-form-opener-input-id');
  const el = document.getElementById(inputId);
  el && (el.value = value);
  Bus.$emit(UPDATE_OPENER_INPUT_EVENT, { value, prop: inputId.split('__')[1]});
  // 关闭弹框
  let { LlFormOpenedWindow } = window;
  LlFormOpenedWindow && LlFormOpenedWindow.close();
};

export default {
  name: 'LlForm',
  inheritAttrs: false,
  components: { Render },
  mixins: [FormItemTypeMap, StepForm],
  props: {
    formItems: {
      type: Array,
      default() {
        return [];
      }
    },
    // 组件布局，组件包含表单内容和表单操作栏两个部分，默认表单内容和表单操作栏都显示，表单内容在前。可调整顺序来改变布局
    layout: {
      type: String,
      default: 'form, operate'
    },
    // 获取表单数据的接口地址或函数
    // 属性值类型为String时，表示获取表单数据的接口地址，请求类型为get，返回的数据应能和表单的model绑定对象属性对应
    // 属性值类型为函数时，表示自己实现表单数据获取工作，通过Promise.resolve(formData)返回表单数据对象
    getData: [String, Function],
    // 提交表单数据的接口地址或函数
    // 属性值类型为String时，表示提交表单数据的接口地址，请求类型为post
    // 属性值类型为函数时，表示自己实现表单数据提交工作，提交函数的参数为formData（表单模型对象），函数实现需返回一个Promise以结束表单的提交操作
    postData: [String, Function],
    // ajax对象或系统全局的Ajax对象名称，需实现了get和post方法
    http: [Object, Function, String],
    // 设置表单交互的提示信息
    message: {
      type: Object,
      validator(msg) {
        const { getFailed, postSuccessed, postFailed } = msg;
        if (!getFailed || !postSuccessed || !postFailed) {
          console.warn(`[ll-form][warn]:表单'message'属性必须包含'getFailed','postSuccessed','postFailed'`);
          return false;
        }
        return true;
      }
    },
    // 表单提交动效控制
    loading: {
      type: Boolean,
      default: false
    },
    // 是否是查看模式
    viewMode: {
      type: Boolean,
      default: false
    },
    // 表单提交时表单数据的格式
    dataType: {
      type: String,
      default: JSON_DATA, // json
      validator(val) {
        if ([JSON_DATA, FORMDATA].includes(val)) {
          return true;
        }
        console.warn(`[ll-form][warn]:表单'data-type'属性的可选值为：'${JSON_DATA}'/'${FORMDATA}'`);
        return false;
      }
    },
    // 表单模式，可选值有add/edit/view，当值为view时如果设置了viewMode属性则viewMode的优先级高于mode属性配置的值
    mode: {
      type: String,
      default: ADD,
      validator(val) {
        if ([ADD, EDIT, VIEW].includes(val)) {
          return true;
        }
        console.warn(`[ll-form][warn]:表单'mode'属性的可选值为：'${ADD}'/'${EDIT}'/'${VIEW}'`);
        return false;
      }
    },
    // 全局配置是否显示表单项label，优先级低于在表单项配置属性里面定义的showLabel属性配置
    showLabel: { type: Boolean, default: true },
    // 全局配置表单项内容是否可清除
    clearable: { type: Boolean, default: false },
    // 是否运行回车提交表单
    enterSubmit: { type: Boolean, default: false },
    // 是否忽略不可编辑字段的值，不将不可编辑字段的属性值作为参数传递给接口
    unsubmitDisabledField: { type: Boolean, default: true },
    // 是否忽略未变更字段的值，不将未修改字段的属性值作为参数传递给接口
    unsubmitUnchangedField: { type: Boolean, default: false },
    // 设置表单元素大小，包括各种类型的输入元素和按钮的大小，可选值有medium/small/mini
    size: { type: String, default: 'small' },
    // 非行内表单（inline）时，控制表单项宽度，默认占满剩余空间
    // 若要单独设置某个表单项的宽度可为其设置width属性，如果在template里面则直接设置style.width
    width: {
      type: [String, Number],
      default: '100%'
    },
    // 表单class名称
    className: String,
    // 文本字符的宽度，该属性只在isViewMode = true（表单查看模式）时有用
    labelCharWidth: { type: Number, default: 15 },
    // 绑定本地原生事件
    nativeOn: { type: Object, default() { return {} } },
    // 表单进行分组时，分组的缩进距离，默认40px
    indent: { type: Number, default: 40 },
    // 控制表单项之间的间距，el-row的gutter属性
    gutter: { type: Number, default: 0 },
    // 表单项输入框气泡提示主题
    tipsEffect: {
      type: String,
      default: 'dark',
      validator(val) {
        if (['dark', 'light'].includes(val)) {
          return true;
        }
        console.warn(`[ll-form][warn]:表单'tips-effect'属性的可选值为：'dark'/'light'`);
        return false;
      }
    },
    /** 表单按钮配置相关属性 */
    // 表单操作按钮设定和布局，支持submit（提交）/reset（重置）/prevStep（上一步，分步表单可用）/nextStep（下一步，分步表单可用）按钮
    actionButtonLayout: {
      type: String,
      default: 'reset, submit'
    },
    // 操作按钮对齐方式，可选值left/center/right
    buttonPosition: { type: String, default: '' },
    // 提交按钮文本
    submitButtonLabel: { type: String, default: '提交' },
    // 提交按钮是否可用，true：可用，false：只有表单校验通过才可用
    submitButtonEnabled: { type: Boolean, default: true },
    // 重置按钮文本
    resetButtonLabel: { type: String, default: '重置' },
    // 重置按钮属性配置对象
    resetButtonAttrs: Object
  },
 
  data() {
    return {
      submiting: false,
      labelWidth: this.$attrs['label-width'] || this.$attrs.labelWidth,
      innerFormItems: [],
      innerFormData: {},
      initedFormData: '',
      fetchCache: {
        valuePromiseRef: {}, // 用于判断是否获取过表单项绑定数据
        optionsPromiseRef: {} // 用于判断是否获取过表单项选项数据
      },
      extendUITypes,
      activeCollapseMap: {}, // 保存表单项分组展开状态
      flattenedFormItems: [], // 保存展平后的表单项配置对象信息
      isSubmitButtonDisabled: !this.submitButtonEnabled, // 表单验证是否通过标志
      effectMap: {}
    };
  },

  computed: {
    layouts() {
      return this.layout.split(',').map(item => item.trim());
    },
    isViewMode() {
      return this.viewMode || this.mode === VIEW;
    },
    isEditMode() {
      return this.mode === EDIT;
    },
    isShowOperate() {
      return this.layouts.includes('operate') && !this.isViewMode;
    },
    isShowCustomOperate() {
      return this.$scopedSlots.operate;
    },
    isInline() {
      const { inline } = this.$attrs;
      return inline || inline === '';
    },
    innerWidth() {
      const { width } = this;
      return typeof width === 'number' ? `${width}px` : width;
    },
    innerLabelWidth() {
      const { labelWidth, isViewMode, innerFormItems, labelCharWidth } = this;
      return labelWidth || (isViewMode 
        // + labelCharWidth是因为自动添加了'：'，所以需要计算上它的宽度
          ? Math.max(...innerFormItems.map(item => (item.label || item.prop || '').length * labelCharWidth + labelCharWidth)) + 'px'
          : null
        );
    },
    nativeListener() {
      const { enterSubmit, _handlerSubmit } = this;
      const nativeOn = {};
      // 开启回车提交功能，监听回车键，触发提交表单
      enterSubmit && (
        nativeOn.keyup = e => {
          const { keyCode, target, ctrlKey } = e;
          // 按下回车键且不是textarea输入框时提交表单，或者是textarea输入框且同时按下了Ctrl+enter时提交表单
          keyCode === 13 && (ctrlKey || target.nodeName !== 'TEXTAREA') && _handlerSubmit();
        }
      );
      return nativeOn;
    }
  },
  watch: {
    formItems: {
      deep: true,
      handler(items) {
        this._checkFormItemProp(items);
        // reRender
        this.innerFormItems = [];
        this.$nextTick(() => {
          this.innerFormItems = this._getSortedFormItems(items);
          this._expandAllCollapse(items);
        })
      }
    },
    loading(val) {
      this.submiting = val;
    },
    '$attrs.model': {
      deep: true,
      immediate: true,
      handler(formData = {}) {
        this.innerFormData = formData;
        (!this.initedFormData || this.initedFormData === '{}') && this._saveInitedFormData(formData);
      }
    },
    // 监听注册UI类型
    extendUITypes: {
      deep: true,
      immediate: true,
      handler(uiTypes = []) {
        const { _addUIType } = this;
        uiTypes.forEach(uiType => {
          const render = uiTypes[uiType];
          _addUIType(uiType, render);
        });
      }
    },
    // 监听表单内容变更，进行校验
    innerFormData: {
      deep: true,
      handler() {
        this._validate();
      }
    },
    // 查看模式时校验规则置空
    isViewMode: {
      immediate: true,
      handler(isViewMode) {
        isViewMode && (this.$attrs.rules = {});
      }
    }
  },

  created() {
    // 更新弹出框类型的表单选项的值
    Bus.$on(UPDATE_OPENER_INPUT_EVENT, e => {
      const { value, prop } = e;
      this.setFormItemValByPath(prop, value);
    });

    // 检查表单配置项是否都设置了prop属性，且prop不能重复
    this._checkFormItemProp(this.formItems);

    // 将表单项按order属性顺序排列
    this.innerFormItems = this._getSortedFormItems(this.formItems);

    // 展开分组节点
    this._expandAllCollapse(this.innerFormItems, true);

    const { getData, http } = this;
    // 回调表单数据
    const _fillFormData = data => {
      if (data && isObject(data) && Object.keys(data).length) {
        this.innerFormData = data;
        // 保存表单初始数据
        this._saveInitedFormData(data);
      } else {
        console.error(`[ll-form][error]:当通过API或者回调函数获取表单绑定对象时，返回值必须是一个非空对象`);
      }
    };

    if (getData) {
      if (isFunction(getData)) {
        getData().then(data => {
          _fillFormData(data);
        });
        return;
      }

      let httpIns = this._getHttpIns(http);
      httpIns
        .get(getData)
        .then(({ data }) => {
          _fillFormData(data);
        })
        .catch(err => {
          this.$message.error((this.message && this.message.getFailed) || '获取表单数据失败');
          console.error(`[ll-form][error]:获取表单数据失败，详情：${err}`);
        });
    }
  },

  beforeDestroy() {
    Bus.$off(UPDATE_OPENER_INPUT_EVENT);
  },

  mounted() {
    const formRef = this.getFormRef();
    // 代理el-form里面的方法，使得在组件里面可以直接通过this调用el-form的方法，eg:this.validate 等价于 this.getFormRef().validate
    delegate.call(this, formRef, ['validate', 'validateField', 'resetFields', 'clearValidate']);

    this.validate = debounce(this.validate, 200); // 表单自带校验函数防抖处理
    this._validate = debounce(this._validate, 300);

    this.$emit('refs', { formRef, uploadRefs: this.getUploadRefs() });
  },

  methods: {
    /**
     * @public
     * 获取表单引用
     * @returns {Ref}
     */
    getFormRef() {
      return this.$refs['ll-form'];
    },
    /**
     * @public
     * 获取表单里所有上传组件的引用
     * @returns {ELUploadRefs}
     */
    getFormRef() {
      const { $refs, flattenedFormItems } = this;
      const refs = [];
      flattenedFormItems.forEach(({ type, prop }) => {
        type === 'upload' && refs.push($refs[`uploadRef_${prop}`]);
      });

      return refs;
    },
    /**
     * @public
     * 重置表单
     * @returns {void}
     */
    resetForm() {
      this._handlerReset();
    },
    /**
     * @public
     * 提交表单
     * @returns {void}
     */
    submitForm() {
      this._handlerSubmit();
    },
    /**
     * 收集通过formItems定义的和el-form-item定义的表单项，检查是否设置了prop属性
     * @param {FormItem[] } formItems 
     */
    _checkFormItemProp(formItems) {
      let baseOrder = 100000;
      // 收集模板语法配置的表单项
      const { $slots } = this;
      const templateFormItems = ($slots.default || []).filter(
        t => t.componentOptions && t.componentOptions.tag === 'el-form-item'
      );

      // 展平表单配置项
      const allFormItems = flattenFormItems([...formItems, ...templateFormItems]).filter(filterUseableFormItem);

      this.flattenedFormItems = allFormItems; // 保存展平后的配置项
      
      const allFormItemsProps = allFormItems.map(item => {
        const { prop, type, effect, render } = item;
        effect && this._collectEffect(prop, effect);

        // 未配置render属性 && 检查表单项是否都配置了prop属性（分组表单和分步表单项配置可以不填写prop）
        if (!render && type && !prop && !['group', 'step'].includes(type)) {
          throw new Error(`[ll-form][error]:表单项必须配置prop属性，配置项信息：${item}`);
        }

        // 没配置order属性，加上默认的order
        if (item.order === undefined) {
          item.order = baseOrder++;
        }

        return prop || '';
      }).filter(prop => !!prop); // 过滤掉无效属性

      // 检查表单项prop属性值是否重复
      allFormItemsProps.forEach((prop, index) => {
        if (allFormItemsProps.indexOf(prop) !== index) {
          throw new Error(`[ll-form][error]:表单项配置的prop属性不能重复，重复的prop属性为：${prop}`);
        }
      });
    },
    /**
     * 表单项按升序排列
     * @param {FormItems[]} formItems 表单项配置集合
     * @returns {FormItem[]} 按升序排列后的表单配置项集合
     */
    _getSortedFormItems(formItems) {
      const _formItems = formItems.filter(filterUseableFormItem); // 去除无意义的表单项配置
      const newFormItems = cloneDeep(_formItems);
      const sortedItems = sortObjectArrayByProp(newFormItems, 'order');
      sortedItems.forEach(item => {
        const { children } = item;
        if (children && children.length > 1) {
          item.children = this._getSortedFormItems(children);
        }
      });

      return sortedItems;
    },
    
  },
  render() {}
};