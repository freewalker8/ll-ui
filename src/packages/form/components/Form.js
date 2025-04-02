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
import extendUITypeMap from '../utils/extendUITypeMap';

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

window.llFormSetValue = function(value) {
  const inputId = window.sessionStorage.getItem('ll-form-opener-input-id');
  const el = document.getElementById(inputId);
  el && (el.value = value);
  Bus.$emit(UPDATE_OPENER_INPUT_EVENT, { value, prop: inputId.split('__')[1] });
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
    nativeOn: {
      type: Object,
      default() {
        return {};
      }
    },
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
      extendUITypeMap,
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
      return (
        labelWidth ||
        (isViewMode
          ? // + labelCharWidth是因为自动添加了'：'，所以需要计算上它的宽度
            Math.max(
              ...innerFormItems.map(
                item => (item.label || item.prop || '').length * labelCharWidth + labelCharWidth
              )
            ) + 'px'
          : null)
      );
    },
    nativeListener() {
      const { enterSubmit, _handlerSubmit } = this;
      const nativeOn = {};
      // 开启回车提交功能，监听回车键，触发提交表单
      enterSubmit &&
        (nativeOn.keyup = e => {
          const { keyCode, target, ctrlKey } = e;
          // 按下回车键且不是textarea输入框时提交表单，或者是textarea输入框且同时按下了Ctrl+enter时提交表单
          keyCode === 13 && (ctrlKey || target.nodeName !== 'TEXTAREA') && _handlerSubmit();
        });
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
        });
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
    extendUITypeMap: {
      deep: true,
      immediate: true,
      handler(uiTypes = {}) {
        const { _addUIType } = this;
        for (const uiType in uiTypes) {
          const render = uiTypes[uiType];
          _addUIType(uiType, render);
        }
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
    getUploadRefs() {
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
      const allFormItems = flattenFormItems([...formItems, ...templateFormItems]).filter(
        filterUseableFormItem
      );

      this.flattenedFormItems = allFormItems; // 保存展平后的配置项

      const allFormItemsProps = allFormItems
        .map(item => {
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
        })
        .filter(prop => !!prop); // 过滤掉无效属性

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
    /**
     * 收集包含副作用的字段的依赖图谱
     * @param {String} prop 会产生副作用的字段属性名称
     * @param {Array<String>} effect 被影响的字段
     */
    _collectEffect(prop, effect) {
      this.effectMap[prop] = effect;
    },
    /**
     * 提交表单
     */
    _handlerSubmit() {
      this.validate(valid => {
        if (!valid) {
          this._expandAllCollapse(this.innerFormItems);
          this.isSubmitButtonDisabled = true;
          return;
        }

        this.submiting = true;

        const {
          innerFormData,
          isEditMode,
          unsubmitDisabledField,
          unsubmitUnchangedField,
          formItems,
          initedFormData,
          _deleteDisabledField,
          _deleteUnChangedField,
          _getHttpIns,
          message,
          postData,
          http
        } = this;
        let formData = innerFormData;

        if (isEditMode) {
          formData = cloneDeep(formData);
          // 忽略不可编辑字段的属性——值，不将其作为参数提交给接口
          unsubmitDisabledField && (formData = _deleteDisabledField(formData, formItems));
          // 忽略未更改字段的属性——值，不将其作为参数提交给接口
          unsubmitUnchangedField && (formData = _deleteUnChangedField(formData, JSON.parse(initedFormData)));
        }

        // 用户配置了dataType属性，要求将表单绑定数据转换成formData
        if (this.dataType === FORMDATA) {
          formData = appendFormData(formData);
        }

        // 暴露submit事件，使得用户可以监听事件自定义提交逻辑
        this.$emit('submit', formData);

        if (isFunction(postData)) {
          // 执行用户自定义的表单提交操作
          postData(formData).finally(() => {
            this.submiting = false;
          });
          return;
        }

        if (typeof postData === 'string') {
          let httpIns = _getHttpIns(http);
          httpIns
            .post(postData, formData)
            .then(res => {
              const { msg, message: _message, result, code } = res || {};
              if (code === 0 || result === 'success') {
                this.$message.success(
                  (message && message.postSuccessed) || _message || msg || result || '表单数据提交成功'
                );
              } else {
                this.$message.eror(
                  (message && message.postFailed) || _message || msg || result || '表单数据提交失败'
                );
              }
            })
            .catch(error => {
              this.$message.eror((message && message.postFailed) || '表单数据提交失败');
              console.error(`[ll-form][error]:表单数据提交失败，详情：${error}`);
            })
            .finally(() => {
              this.submiting = false;
            });
        }
      });
    },
    /**
     * 字段不可编辑，且不是必填项且存在该字段则删除该字段
     * @param {Object} formData 表单数据
     * @param {Array<Object>} formItems 表单项配置
     * @param {Array<String>} basePaths 辅助参数
     * @return {Object} 过滤后的表单数据
     */
    _deleteDisabledField(formData, formItems, basePaths = []) {
      const _formData = formData;
      const formItemsLen = formItems.length;
      const { _isRequiredField, _deleteDisabledField } = this;

      formItems.forEach((item, index) => {
        const { prop, formElementProps = {}, children, required = false } = item;
        const propValue = _formData[prop];

        // 是必填项，跳过比对
        if (required || _isRequiredField(prop, basePaths, item)) return;

        // 字段不可编辑，存在字段则删除该表单字段
        if (formElementProps.disabled && propValue !== undefined) {
          delete _formData[prop];
          return;
        }

        if (children && isObject(propValue)) {
          basePaths.push(prop); // 保存路径
          _deleteDisabledField(propValue, children, basePaths);
        }

        // 当前子对象遍历完，将当前父路径出栈
        if (index === formItemsLen - 1) {
          basePaths.pop();
        }
      });

      return _formData;
    },
    /**
     * 属性非必填项时删除属性值未改变的字段
     * @param {Object} formData 表单数据
     * @param {Object} initedFormData 表单初始数据
     * @param {Array<String>} basePaths 辅助参数
     * @return {Object} 过滤后的表单数据
     */
    _deleteUnChangedField(formData, initedFormData, basePaths = []) {
      const _formData = formData;
      const props = Object.keys(_formData);
      const propsLen = props.length;
      const { _isRequiredField, _deleteUnChangedField } = this;

      props.forEach((prop, index) => {
        // 是必填项，跳过比对
        if (_isRequiredField(prop, basePaths)) return;

        const currentValue = _formData[prop];
        const oldValue = initedFormData[prop];

        if (isObject(currentValue)) {
          basePaths.push(prop); // 保存路径
          _deleteUnChangedField(currentValue, oldValue, basePaths);
        } else {
          isValueEqual(currentValue, oldValue) && delete _formData[prop];
        }

        // 当前子对象遍历完，将当前父路径出栈
        if (index === propsLen - 1) {
          basePaths.pop();
        }
      });

      return _formData;
    },
    /**
     * 判断是不是必填项
     * @param {String} prop 字段
     * @param {Array<String>} basePaths 当前字段的父路径
     * @param {Object} formItem 表单项配置对象
     * @return {Boolean}
     */
    _isRequiredField(prop, basePaths, formItem) {
      const formItemRules = getObjectPropVal(
        this.$attrs.rules, // rules对象里面的key存在多层级时通过'.'连接，所以下面的第二个参数也需要用'.'连接
        // 包含基础属性路径且当前属性值里面不包含'.'就将基础路径通过'.'连起来，再和最后一级属性通过'.'连接，组合形成对象的属性key
        basePaths.length && !prop.includes('.') ? `${basePaths.join('.')}.${prop}` : prop
      );

      // 是否必填
      if (formItemRules && formItemRules.some(rule => !!rule.required)) {
        return true;
      }

      const _formItem = formItem || (getObjArrayItemByKeyValue(this.formItems, 'prop', prop) || {}).item;
      // 判断表单项配置里面是否定义了必填
      if (_formItem) {
        return !!_formItem.required;
      }

      return false;
    },
    /**
     * 重置表单
     */
    _handlerReset() {
      this.clearValidate();
      this.resetFields();
    },
    /**
     * 获取http实例
     * @param {Object|Function|String} http 用户传入的http实例
     * @return {Function} http instance
     */
    _getHttpIns(http) {
      const httpIns = http ? (isObject(http) || isFunction(http) ? http : this[http]) : this.$http;
      if (!httpIns) {
        throw new Error(`[ll-form][error]:获取HTTP实例失败，请通过组件'http'属性配置`);
      }

      if (!httpIns.get || !httpIns.post) {
        throw new Error(`[ll-form][error]:HTTP实例失败必须包含'get'和'post'方法`);
      }

      return httpIns;
    },
    /**
     * 计算表单元素的宽度
     * @param {String|Number} width 表单元素宽度
     * @param {String} defaultVal 默认宽度
     * @return {String} 表单宽度
     */
    _calcFormElWidth(width, defaultVal) {
      return width
        ? typeof width === 'number'
          ? `${width}px`
          : width
        : this.isInline
        ? defaultVal || ''
        : this.innerWidth;
    },
    /**
     * 展开所有表单项分组
     * @param {Array<FormItem>} innerFormItems 表单项配置数组
     * @param {Boolean} inited 是否是初始化表单
     */
    _expandAllCollapse(innerFormItems, inited = false) {
      const activeCollapseMap = {};
      const { _expandAllCollapse } = this;
      innerFormItems.map(({ prop, expand = true, children = [] }) => {
        if (children.length) {
          activeCollapseMap[prop] = inited ? (expand ? [prop] : '') : [prop];
          _expandAllCollapse(children, inited);
        }
      });

      this.activeCollapseMap = { ...this.activeCollapseMap, ...activeCollapseMap };
    },
    /**
     * 校验表单是否合法
     */
    _validate() {
      const { submitButtonEnabled, isSubmitButtonDisabled, validate } = this;
      // 开启了表单合法，提交按钮才可用开关后，表单内容变化时，校验表单是否合法，不合法提交按钮不可用
      // 如果提交按钮不可用，也执行表单检查
      (!submitButtonEnabled || isSubmitButtonDisabled) &&
        validate(valid => {
          this.isSubmitButtonDisabled = !valid;
        });
    },
    /**
     * 保存表单初始数据
     * @param {Object} formData 表单数据
     */
    _saveInitedFormData(formData) {
      this.initedFormData = JSON.stringify(formData);
    },
    /**
     * 生成默认操作按钮
     */
    _renderActionButton() {
      const {
        actionButtonLayout,
        size,
        submiting,
        isSubmitButtonDisabled,
        resetButtonAttrs,
        resetButtonLabel,
        submitButtonAttrs,
        submitButtonLabel,
        prevStepLabel,
        nextStepLabel,
        step,
        buttonPosition,
        innerActiveStep,
        stepsConfig,
        _handlerReset,
        _handlerSubmit,
        _handerStep
      } = this;

      // 判断是否显示操作按钮
      if (!actionButtonLayout.trim()) {
        return null;
      }

      let buttons = actionButtonLayout.split(',').map(b => b.trim());
      const defaultButtonAttrs = { size };
      const innerResetButtonAttrs = {
        type: 'default',
        ...defaultButtonAttrs,
        ...(resetButtonAttrs || {})
      };
      const innerSubmitButtonAttrs = {
        type: 'primary',
        ...defaultButtonAttrs,
        ...(submitButtonAttrs || {})
      };
      const btnMap = {
        reset: (
          <el-button onClick={_handlerReset} {...{ props: innerResetButtonAttrs }}>
            {resetButtonLabel}
          </el-button>
        ),
        submit: (
          <el-button
            onClick={_handlerSubmit}
            loading={submiting}
            {...{ props: { disabled: isSubmitButtonDisabled, ...innerSubmitButtonAttrs } }}>
            {submitButtonLabel}
          </el-button>
        ),
        prevStep: (
          <el-button
            onClick={() => _handerStep(-1)}
            {...{
              props: innerSubmitButtonAttrs,
              style: { display: innerActiveStep === 0 ? 'none' : 'inline-block' }
            }}>
            {prevStepLabel}
          </el-button>
        ),
        nextStep: (
          <el-button
            onClick={() => _handerStep(1)}
            {...{
              props: innerSubmitButtonAttrs,
              style: { display: innerActiveStep === stepsConfig.length - 1 ? 'none' : 'inline-block' }
            }}>
            {nextStepLabel}
          </el-button>
        )
      };

      // 分布表单必须有上一步和下一步按钮
      if (step) {
        !buttons.includes('prevStep') && buttons.unshift('prevStep');
        !buttons.includes('nextStep') && buttons.unshift('nextStep');
      } else {
        // 不是分步表单，但填写了prevStep和nextStep按钮配置，则将其删除，只有分步表单才有该按钮
        let index = -1;
        index = buttons.indexOf('prevStep');
        index !== -1 && buttons.splice(index, 1);
        index = buttons.indexOf('nextStep');
        index !== -1 && buttons.splice(index, 1);
      }

      return buttonPosition ? (
        <el-col
          style={{
            textAlign: buttonPosition,
            paddingLeft: buttonPosition === 'left' ? this.innerLabelWidth : ''
          }}>
          {buttons.map(b => btnMap[b])}
        </el-col>
      ) : (
        <el-col>
          <el-form-item>{buttons.map(b => btnMap[b])}</el-form-item>
        </el-col>
      );
    },
    /**
     * 生成表单项的原生事件绑定配置
     * @param {Object} nativeOn 表单项配置的原生事件配置对象
     * @returns {Object}
     */
    _genNativeOn(nativeOn = {}) {
      const { nativeListener } = this;
      let realNativeOn = { ...nativeListener, ...nativeOn };

      // 用户设置了keyup监听
      if (nativeOn.keyup) {
        const originKeyup = nativeOn.keyup;
        const defaultKeyup = nativeListener.keyup;
        realNativeOn.keyup = function(e) {
          originKeyup.call(null, e); // 执行用户自定义的keyup事件回调
          defaultKeyup && defaultKeyup.call(null, e); // 执行表单组件默认的keyup事件回调
        };
      }

      return realNativeOn;
    },
    /**
     * 渲染表单项
     * @param {Function} h createElement
     * @param {Array<FormItem>} formItems 表单项配置
     * @returns {Array<VM>}
     */
    _renderFormItems(h, formItems) {
      const {
        innerFormData,
        formItemTypeMap,
        fetchCache,
        isViewMode,
        size,
        isInline,
        tipsEffect,
        clearable,
        showLabel,
        _renderStepForm,
        _renderGroupFormItem,
        _saveInitedFormData,
        _genNativeOn
      } = this;

      return formItems.map((formItemConfig, index) => {
        const {
          type,
          span,
          render,
          viewRender, // 自定义查看模式时表单项的值
          labelRender,
          tips,
          fetchData,
          fetchOptions,
          formElementProps = {},
          children,
          display = true,
          visiable = true,
          effected = false,
          showLabel: innerShowLabel,
          // form-item的vue实例组件属性
          class: domClass = '',
          style,
          attrs,
          props,
          domProps,
          on,
          nativeOn: formItemNativeOn,
          key,
          ref,
          slot,
          scopedSlots,
          directives,
          ...formItemProps // el-form-item的prop属性
        } = formItemConfig;
        const { prop } = formItemProps;

        // 处理表单项的原生事件绑定
        const nativeOnProxy = _genNativeOn(formElementProps.nativeOn);
        // 判断表单是否全局设置了表单项内容可清除，设置了且表单项自己未设置clearable配置则继承全局配置
        clearable && formElementProps.clearable === undefined && (formElementProps.clearable = true);
        // 判断是否渲染表单项，display为true时渲染；
        if (!(isFunction(display) ? display(innerFormData) : display)) {
          return null;
        }

        const realShowLabel = innerShowLabel !== undefined ? innerShowLabel : showLabel;

        if (type === 'group') {
          if (isArray(children)) {
            return _renderGroupFormItem(h, formItemConfig);
          } else {
            throw new TypeError(`[ll-form][error]:表单项type属性值为'group'时，必须包含'children'属性。`);
          }
        }

        if (type === 'step') {
          if (isArray(children)) {
            return _renderStepForm(h, children, index);
          } else {
            throw new TypeError(`[ll-form][error]:表单项type属性值为'step'时，必须包含'children'属性。`);
          }
        }

        const formInputerRender = type && formItemTypeMap[type];

        if (type && !formInputerRender) {
          throw new Error(`[ll-form][error]:不支持表单项类型'${type}'，检查你表单项配置的'type'类型配置。`);
        }

        if (fetchData) {
          if (effected) {
            fetchCache.valuePromiseRef[prop] = fetchData().then(res => {
              this.$set(this.innerFormData, prop, res || '');
              formItemConfig.effected = false;
            });
          } else {
            !fetchCache.valuePromiseRef[prop] &&
              (fetchCache.valuePromiseRef[prop] = fetchData().then(res => {
                this.innerFormData[prop] = res;
                _saveInitedFormData(innerFormData);
              }));
          }
        }

        if (fetchOptions) {
          // 未设置options属性默认值，设置一个
          !formElementProps.options && this.$set(formElementProps, 'ooptions', []);

          // 该字段的可选值受到了其它字段的影响
          if (effected) {
            this.$set(this.innerFormData, prop, '');
            fetchCache.optionsPromiseRef[prop] = fetchOptions().then(res => {
              formItemConfig.formElementProps.options = res;
              formItemConfig.effected = false;
            });
          } else {
            !fetchCache.optionsPromiseRef[prop] &&
              (fetchCache.optionsPromiseRef[prop] = fetchOptions().then(res => {
                formItemConfig.formElementProps.options = res;
              }));
          }
        }

        let formItemClass = Array.isArray(domClass) ? domClass : [domClass];
        formItemClass.push(`ll-form-item-${prop}`);

        const componentOptions = {
          props: { ...props, ...formItemProps },
          domProps,
          class: formItemClass,
          style,
          attrs,
          on,
          nativeOn: formItemNativeOn,
          key,
          ref,
          slot,
          scopedSlots,
          directives
        };

        // 是否渲染并隐藏表单项
        if (!(isFunction(visiable) ? visiable(innerFormData) : visiable)) {
          componentOptions.class = [...formItemClass, 'll-form__hidden'];
          formElementProps.disabled = true;
        }

        if (labelRender) {
          componentOptions.scopedSlots = { label: labelRender };
        }

        let template = null;

        // 查看模式
        if (isViewMode) {
          template = (
            <el-form-item
              {...{
                props: {
                  label: `${formItemProps.label}:`
                },
                class: formItemClass,
                style
              }}>
              {viewRender ? (
                <Render render={viewRender}></Render>
              ) : (
                (getObjPropValByPath(innerFormData, prop) || '').toString()
              )}
            </el-form-item>
          );
        } else {
          template = render ? (
            <Render render={render} {...{ props: { nativeOn: nativeOnProxy } }}></Render>
          ) : isFunction(formInputerRender) ? (
            formInputerRender(h, {
              prop,
              size,
              nativeOn: nativeOnProxy,
              formElementProps, // 表单配置项对象，全部配置信息，select远程搜索时会使用
              ...formElementProps
            })
          ) : null;

          // 需要展示气泡提示
          if (tips) {
            template = (
              <el-tooltip content={tips} effect={tipsEffect} placement='top-start'>
                {template}
              </el-tooltip>
            );
          }

          // 需要展示表单项label
          if (realShowLabel) {
            template = <el-form-item {...componentOptions}>{template}</el-form-item>;
          } else if (!showLabel) {
            template = <div class='ll-form__no-label'>{template}</div>;
          }
        }

        return isInline ? (
          template
        ) : (
          <el-col span={span || 24} class={visiable ? '' : 'll-form__hidden'}>
            {template}
          </el-col>
        );
      });
    },
    /**
     * 渲染表单项分组
     * @param {Function} h createElement
     * @param {FormItem} formItem 表单项配置 { prop, label, children }
     * @returns {jsx}
     */
    _renderGroupFormItem(h, formItem) {
      const { prop, label, children, indent } = formItem;
      const groupLevel = prop.split('.').length - 1;
      const { indent: _commonIndent, gutter, activeCollapseMap, _renderFormItems } = this;

      return (
        <el-row
          class='ll-form__clear-both'
          style={{ paddingLeft: `${parseInt(indent) || _commonIndent * groupLevel}px` }}
          gutter={gutter}>
          <el-collpase vModel={activeCollapseMap[prop]}>
            <el-collpase-item title={label} name={prop}>
              {_renderFormItems(h, children)}
            </el-collpase-item>
          </el-collpase>
        </el-row>
      );
    },
    /**
     * 注册表单项ui类型
     * @param {String} uiType 自定义的ui类型
     * @param {(h, attrs) => JSX} render ui类型对应的实现函数
     */
    _addUIType(uiType, render) {
      const { formItemTypeMap, _genNativeOn, genComponentConfig } = this;
      // 避免重复注册
      if (!formItemTypeMap[uiType]) {
        formItemTypeMap[uiType] = (h, attrs) => {
          const { nativeOn = {} } = attrs;
          const componentConfig = genComponentConfig(attrs);
          const realNativeOn = _genNativeOn(nativeOn);

          return render(h, { ...componentConfig, nativeOn: realNativeOn });
        };
      }
    }
  },
  render(h) {
    const {
      step,
      stepsPosition,
      className,
      isShowOperate,
      innerLabelWidth,
      innerFormData,
      innerFormItems,
      isViewMode,
      layouts,
      gutter,
      nativeOn,
      $scopedSlots,
      $slots,
      $attrs,
      $listeners,
      validate,
      _handlerReset,
      _handlerSubmit,
      _renderActionButton,
      _renderFormItems,
      _renderSteps
    } = this;

    const layoutMap = {
      operate: isShowOperate ? (
        <el-row class={'ll-form__operate'} gutter={gutter}>
          {this.isShowCustomOperate ? (
            <el-col>
              {$scopedSlots.operate({
                formData: innerFormData,
                resetForm: _handlerReset,
                submitForm: _handlerSubmit,
                validateForm: validate
              })}
            </el-col>
          ) : (
            _renderActionButton()
          )}
        </el-row>
      ) : null,
      form: (
        <el-row class={'ll-form__content'} gutter={gutter}>
          {_renderFormItems(h, innerFormItems)}
          {/* 渲染通过vue模板定义的表单项 */}
          {<template slot='default'>{$slots.default}</template>}
        </el-row>
      )
    };

    const formTemplate = (
      <el-form
        ref='ll-form'
        class={['ll-form', isViewMode ? 'll-form__view' : `ll-form__${this.mode}`, className]}
        {...{
          props: {
            size: this.size,
            labelWidth: innerLabelWidth,
            ...$attrs,
            disabled: isViewMode || $attrs.disabled
          },
          on: { ...$listeners },
          nativeOn
        }}>
        {layouts.map(mdl => layoutMap[mdl])}
      </el-form>
    );

    if (step) {
      if (stepsPosition === 'top') {
        return (
          <div>
            {_renderSteps()}
            {formTemplate}
          </div>
        );
      } else {
        // left
        let { stepsWidth, stepsHeight } = this;
        stepsWidth = isTypeOf(stepsWidth, 'number') ? `${stepsWidth}px` : stepsWidth;
        stepsHeight = isTypeOf(stepsHeight, 'number') ? `${stepsHeight}px` : stepsHeight;

        return (
          <div style={{ display: 'flex' }}>
            <div {...{ style: { flexBasis: stepsWidth, height: stepsHeight } }}>{_renderSteps()}</div>
            <div {...{ style: { flexGrow: 2 } }}></div>
          </div>
        );
      }
    }

    return formTemplate;
  }
};
