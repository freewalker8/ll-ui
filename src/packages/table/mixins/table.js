/*
 * @Author: lianglei stone.ll@qq.com
 * @Date: 2025-04-02 10:59:59
 * @LastEditors: lianglei stone.ll@qq.com
 * @LastEditTime: 2025-04-10 12:37:19
 * @FilePath: \ll-form-table\src\packages\table\mixins\table.js
 * @Description: 表格
 */
import { debounce, cloneDeep } from 'lodash-es';
import {
  delegate,
  sortObjectArrayByProp,
  getObjArrayItemByKeyValue,
  objPropToCamelCase,
  isArray,
  isFunction,
  isBoolean,
  sleep
} from '../../../utils/util';
import Render from '../../../utils/render';
import { getRowIdentity } from '../utils';
import { highLightTransfer, editableRender, emptyPlaceholderRender } from '../render-func';
import columnFilter from './columnFilter'; // 列过滤
import actionColumn from './actionColumn'; // 操作列
import disableHScroll from './disableHScroll'; // 禁用横向滚动条
import dragRow from './dragRow'; // 行可拖拽
import dragable from '../directives/dragable';
import resize from '../directives/resize';

import DefaultProps from '../config';
import { TH_BASE_CLASS, TD_BASE_CLASS } from '../config/const';

import '../style/index.scss';

const specialColumns = ['selection', 'index', 'expand'];
const getExpandableUniqueClassName = function(rowKeyVal) {
  return `ll-table__expandable-${rowKeyVal}`;
};

export default {
  inheritAttrs: false, // 未被识别为props的属性，将不会出现在根元素上
  components: { Render },
  mixins: [columnFilter, actionColumn, dragRow, disableHScroll],
  props: {
    /**
     * 表格布局排列方式，用于设置模块是否展示及展示顺序
     * 支持配置'tool, table, extra, pagination'，分别表示工具栏、表格、附件内容、分页器
     * 同一个模块可多次展示，比如上下都展示分析器，则配置为`tool, pagination, table, pagination`
     */
    layout: {
      type: String,
      default: 'tool, table, pagination'
    },
    data: {
      type: Array,
      default() {
        return [];
      }
    },
    columns: {
      type: Array,
      default: () => []
    },
    rowKey: {
      type: [String, Function],
      default: 'id'
    },
    // 表格单元格内容为空时的占位内容，默认判断单元格为空的值包含空字符串和undefined;为函数时自行判断是否为空，返回空值占位符
    emptyPlaceholder: {
      type: [String, Function],
      default: ''
    },
    // 单元格是否可编辑
    editable: {
      type: Boolean,
      default: false
    },
    // 是否点击单元格才展示编辑框
    clickEdit: {
      type: Boolean,
      default: true
    },
    // 编辑框失去焦点时是否自动发送cell-change事件以便监听保存
    autoSave: {
      type: Boolean,
      default: true
    },
    // 是否开启回车提交，触发cell-change事件
    enterSave: {
      type: Boolean,
      default: false
    },
    // 保存按钮文本
    saveLabel: {
      type: String,
      default: '保存'
    },
    // 取消按钮文本
    cancelLabel: {
      type: String,
      default: '取消'
    },
    // 手动触发变更事件时，用户未保存单元格数据时的提示信息
    saveMessage: {
      type: String,
      default: '编辑内容未保存'
    },
    // 是否可拖动排序
    dragSortable: {
      type: Boolean,
      default: false
    },
    // 拖动模式，可选表头模式（拖动表头排序）和过滤表单item拖动模式（在列过滤表单里面拖动列item进行排序）
    dragSortMode: {
      type: String,
      default: 'thead',
      validator(val) {
        return ['thead', 'formItem'].includes(val);
      }
    },
    // 默认选中的行，table-column的type属性值为selection时生效
    selection: {
      type: Array,
      default() {
        return [];
      }
    },
    // 默认选中的行完整数据，table-column的type属性值为selection时生效
    selectionData: {
      type: Array,
      default() {
        return [];
      }
    },
    // 默认需要展开的行，数据由row-key组成
    expandRows: {
      type: Array,
      default() {
        return [];
      }
    },
    // 是否可分页
    pageable: {
      type: Boolean,
      default: true
    },
    // 是否支持分页选中，切换分页时保存选中状态
    paginationSelectable: {
      type: Boolean,
      default: false
    },
    // 点击选中行时是否进行深度选中（选中节点的子节点），默认关闭
    deepSelect: {
      type: Boolean,
      default: false
    },
    // 是否将分页栏固定到页面底部，使用该功能必须开启auto-height
    paginationFixedOnButtom: {
      type: Boolean,
      default: false
    },
    currentPage: {
      type: Number,
      default: 1
    },
    pageSize: Number,
    // 分页器配置，可配置属性与el-pagination组件一致
    paginationProps: {
      type: Object,
      default() {
        return {};
      }
    },
    // 只有一页时是否隐藏分页器，paginationProps.hideOnSinglePage的别名配置，优先级高于paginationProps.hideOnSinglePage
    hideOnSinglePage: {
      type: [Boolean, undefined],
      default: undefined
    },
    customTableClass: String,
    // 是否响应浏览器窗口大小改变以便改变表格内容区高度
    autoHeight: {
      type: Boolean,
      default: true
    },
    // 表格内容区最小高度
    minHeight: {
      type: Number,
      default: 100
    },
    // 表格内容区高度的修正系数
    fixHeight: {
      type: Number,
      default: 100
    },
    // 表格内容上中下布局，中间内容区自适应撑开，上部工具栏和下部分页器高度固定
    tcdLayout: {
      type: Boolean,
      default: false
    }
  },
  directives: {
    dragable,
    resize
  },
  data() {
    return {
      baseOrder: 100, // 未显示设置表格列的order属性时，表格列order属性的基础值
      columnCounter: 0, // 记录总共有多少列
      allColumns: [], // 所有一级列，多级表头时，下面的列没记入其中，而是属于一级列的子列
      tableColumns: [], // 渲染表格的列的数据
      canFilterColumns: [], // 可过滤的列，用于展示到过滤表单
      innerCurrentPage: 1,
      innerPageSize: this.pageSize || DefaultProps.paginationProps.pageSize || 10,
      innerPaginationProps: {},
      // 表格状态相关参数
      pageSelection: [], // 选中的行的row-key组成的数组
      pageSelectionData: [], // 选中行的行数据组成的数组
      allSelection: [],
      allSelectionData: [],
      innerExpandRowKeys: [] // 展开的行，数据由row-key组成
    };
  },
  computed: {
    layouts() {
      return (this.layout || DefaultProps.layout).split(',').map(item => item.trim());
    },
    // 只有一页时是否隐藏分页栏
    isHideOnSinglePage() {
      const { innerPaginationProps, hideOnSinglePage } = this;
      let _hideOnSinglePage =
        hideOnSinglePage === undefined
          ? DefaultProps.hideOnSinglePage || DefaultProps.paginationProps.hideOnSinglePage
          : hideOnSinglePage;

      if (_hideOnSinglePage !== undefined) {
        innerPaginationProps.hideOnSinglePage = _hideOnSinglePage;
      }

      const { pageSize } = innerPaginationProps;

      // 配置了hideOnSinglePage且值为true && 数据总数小于等于分页大小
      return innerPaginationProps.hideOnSinglePage && this.innerTotal.length <= pageSize;
    },
    paginationShow() {
      // 配置了需要展示分页栏 && 未设置只有一页隐藏分页器
      return this.pageable && this.layouts.includes('pagination') && !this.isHideOnSinglePage;
    },
    toolBarShow() {
      return this.layouts.includes('tool') && this.$scopedSlots.tool;
    },
    extraShow() {
      return this.layouts.includes('extra') && this.$slots.extra;
    },
    // 开启列过滤时合并过滤列和倒数第二列时倒数第二列的index（index从0开始）
    colspanColumnFix() {
      return this.showActionColumn ? this.columnCounter : this.columnCounter - 1;
    }
  },
  watch: {
    // 监听动态修改表格列配置
    columns: {
      handler() {
        this._initTable();
        this.$nextTick(() => {
          this.$emit('column-filter'); // 修改了列信息，触发下列筛选事件，从而触发重新绑定拖动事件
        });
      }
    },
    allColumns: {
      deep: true,
      handler(columns) {
        this.tableColumns = []; // 清空，触发更新
        this.$nextTick(() => {
          this.tableColumns = this.checkedColumns.length
            ? columns.filter(({ prop, type }) => {
                // 被选中的列和索引选择列（有type属性的列）进行展示
                return this.checkedColumns.includes(prop) || !!type;
              })
            : columns;
          // bugfix:修复el-talbe的default-sort失效的问题
          // reason：这里设置了表格列后会进行表格渲染，渲染未完成时default-sort不会生效，el-talbe的源码里面就是在渲染完成后触发的排序
          let defaultSort;
          (defaultSort = this.$attrs['default-sort']) &&
            this.$nextTick(() => {
              const el = this.getTableRef();
              const { prop, order } = defaultSort;
              const init = true;
              el.store.commit('sort', { prop, order, init });
            });
        });
      }
    },
    // make innerCurrentPage and innerPageSize as data,
    // and watch currentPage to update innerCurrentPage, pageSize to update innerPageSize
    // at the same time watch innerCurrentPage and innerPageSize to emit sync emit.
    // the two watch cannot be replaced by computed getter and setter here,
    // because currentPage and pageSize can be not provided(undefined).
    pageSize: {
      immediate: true,
      handler(val) {
        val && (this.innerPageSize = val);
      }
    },
    innerPageSize(newVal, oldVal) {
      this.$nextTick(() => {
        this.innerPaginationProps.pageSize = newVal;
        if (oldVal !== newVal) {
          this.$emit('update:pageSize', newVal);
          this.$emit('size-change', newVal);
          this.$emit('pagination-change', {
            pageSize: newVal,
            currentPage: this.innerCurrentPage
          });
        }
      });
    },
    currentPage: {
      immediate: true,
      handler(val) {
        val && (this.innerCurrentPage = val);
      }
    },
    innerCurrentPage(newVal, oldVal) {
      this.$nextTick(() => {
        this.innerPaginationProps.currentPage = newVal;
        if (oldVal !== newVal) {
          this.$emit('update:currentPage', newVal);
          this.$emit('current-page-change', newVal);
          this.$emit('pagination-change', {
            pageSize: this.innerPageSize,
            currentPage: newVal
          });
        }
      });
    },
    selection: {
      deep: true,
      immediate: true,
      handler(rowKeys) {
        this._initAllSelection(rowKeys);

        this.$nextTick(() => {
          this._checkRows(rowKeys);
        });
      }
    },
    curTableData(val) {
      if (!val.length) return;

      const { selection, innerExpandRowKeys, paginationSelectable } = this;

      // 展开行
      if (innerExpandRowKeys.length) {
        this.$nextTick(() => {
          this.toggleRowsExpansion(innerExpandRowKeys);
        });
      }

      // 勾选行
      this.$nextTick(() => {
        if (selection.length || paginationSelectable) {
          this._clearPageSelection();
          this._checkRows(paginationSelectable ? this.allSelection : selection);
        }
      });
    },
    expandRows: {
      deep: true,
      immediate: true,
      handler(data) {
        this.innerExpandRowKeys = [...data];
      }
    },
    // 监听表格内容区高度修正系数，重新计算表格内容区高度
    fixHeight() {
      this.$nextTick(() => {
        this.$emit('ll-table:calc');
      });
    }
  },
  created() {
    this._emitDataEdit = debounce(this._emitDataEdit, 50, { leading: true, trailing: false });
    this._selectionChange = debounce(this._selectionChange, 50);

    // 获取表格列信息和可过滤列的信息
    this._initTable();

    // 订阅拖动排序
    this.dragSortable &&
      this.$on('column-sorted', data => {
        this._handlerDragSort(data);
      });
  },
  mounted() {
    delegate.call(this, this.getTableRef(), [
      'clearSelection',
      'toggleRowSelection',
      'toggleAllSelection',
      'toggleRowExpansion',
      'setCurrentRow',
      'clearSort',
      'clearFilter',
      'doLayout',
      'sort'
    ]);

    // dom loaded && 实例挂载完成，发送ll-table:mounted事件
    this._handleDomLoaded();
  },
  beforeDestroy() {
    this.dragSortable && this.$off('column-sorted');
  },
  methods: {
    /**
     * @public
     * 获取组件使用的el-table的ref
     */
    getTableRef() {
      return this.$refs.elTable;
    },
    /**
     * @public
     * 获取组件使用的el-pagination的ref
     */
    getPaginationRef() {
      return this.$refs.elPagination;
    },
    /**
     * @public
     * 清除所有选中行信息
     */
    clearAllSelection() {
      this.allSelection = [];
      this.allSelectionData = [];
      this._clearPageSelection();
      this.clearSelection
        ? this.clearSelection()
        : this.$nextTick(() => {
            this.clearSelection();
          });
    },
    /**
     * @public
     * 重新渲染表格
     * @param {Boolean} keepStatus 是否保留表格状态，默认为true
     */
    reRender(keepStatus = true) {
      this.$nextTick(() => {
        this._initTable(keepStatus);
      });
    },
    /**
     * @public
     * 触发重新计算表格内容区高度
     * @param {Number} offset 高度修正系数
     */
    fixTableContentHeight(offset = 0) {
      this.$nextTick(() => {
        this.$emit('ll-table:calc', offset);
      });
    },
    /**
     * @public
     * 展开、折叠节点
     * @param {Array<String>} rowKeys 需要展开行的key集合
     */
    toggleRowsExpansion(rowKeys) {
      if (!rowKeys.length) return;

      const { childrenKey } = this._getTreePropsKey();
      const { load, lazy } = this.$attrs;

      // 异步加载子节点
      if (lazy !== undefined && load) {
        this._clickToggleExpansion(rowKeys, childrenKey);
      } else {
        // 子节点已预先加载好
        this._toggleRowsExpansion(rowKeys, childrenKey);
      }
    },
    /**
     * 清空当前页选中数据
     */
    _clearPageSelection() {
      this.pageSelection = [];
      this.pageSelectionData = [];
    },
    /**
     * 展开、折叠节点
     * @param {Array<String>} rowKeys 需要展开行的key集合
     */
    _toggleRowsExpansion(rowKeys, childrenKey) {
      const { toggleRowExpansion } = this;
      const deepExpand = (rows, rowKeys) => {
        rows.forEach(row => {
          const keyVal = getRowIdentity(row, this.rowKey);
          const children = row[childrenKey];
          toggleRowExpansion(row, rowKeys.includes(keyVal)); // 展开、隐藏节点
          isArray(children) && deepExpand(children, rowKeys); // 遍历展开子节点
        });
      };

      deepExpand(this.curTableData, rowKeys);
    },
    /**
     * 通过执行click操作，根据rowkeys展开、收起对应的行
     * @param {Array<String|Number>} rowKeys 需要展开、收起的行的rowKey集合
     * @param {String} childrenKey 子节点属性名称
     */
    _clickToggleExpansion(rowKeys, childrenKey) {
      const deepExpand = (rows, rowKeys) => {
        const { rowKey } = this;
        rows.forEach(row => {
          const keyVal = getRowIdentity(row, rowKey);
          const children = row[childrenKey];
          const isTarget = rowKeys.includes(keyVal);

          if (isTarget) {
            const selector = `.el-table__body-wrapper .${getExpandableUniqueClassName(
              keyVal
            )} .el-table__expand-icon`;
            const dom = this.$el.querySelector(selector);

            dom && dom.click(); // 展开、隐藏节点
          }

          if (isArray(children)) {
            deepExpand(children, rowKeys);
          }
        });
      };

      deepExpand(this.curTableData, rowKeys);
    },
    /**
     * 获取tree-props配置的key映射信息
     * @returns {Object<{ hasChildrenKey: String, childrenKey: String }>}
     */
    _getTreePropsKey() {
      const treeProps = this.$attrs.treeProps || this.$attrs['tree-props'] || {};
      const hasChildrenKey = treeProps.hasChildren || 'hasChildren';
      const childrenKey = treeProps.children || 'children';

      return {
        hasChildrenKey,
        childrenKey
      };
    },
    /**
     * 初始化所有选中行数据的信息
     * @param {Array<String>} rowKeys 需要选中行的key集合
     */
    _initAllSelection(rowKeys) {
      let allSelection = [];
      let allSelectionData = [];

      if (this.paginationSelectable) {
        allSelection = rowKeys;

        // 用户设置了选中数据的完整数据信息
        if (this.selectionData.length) {
          allSelectionData = this.selectionData;
        } else {
          // 用户未设置selectionData,根据selection来添加
          // 初始化时这里保存的allSelectionData很可能不完整，因为这里只能获取到第一页的表格数据，在翻页执行选中行（this._checkRows）时去判断新增剩余数据到allSelectionData
          // 所以安全的操作选中表格数据的方法是通过pageSelection或者allSelection来取到行数据的唯一标识符进行操作
          this.curTableData.forEach(row => {
            if (rowKeys.includes(getRowIdentity(row, this.rowKey))) {
              allSelectionData.push(row);
            }
          });
        }

        this.allSelection = allSelection;
        this.allSelectionData = allSelectionData;
      }
    },
    /**
     * 重置表格
     * 如果有自定义的工具栏则需要自己先清除搜索条件
     */
    _resetTable() {
      const {
        pageSize,
        selection,
        expandRows,
        _clearPageSelection,
        _initAllSelection,
        _checkRows,
        toggleRowsExpansion,
        clearFilter,
        clearSelection,
        clearSort
      } = this;

      this.innerCurrentPage = 1;
      this.innerPageSize = pageSize || DefaultProps.paginationProps.pageSize;

      clearFilter(); // 清除过滤条件
      clearSelection(); // 清除选择
      !this.$attrs['default-sort'] && clearSort(); // 未设置默认排序时才清除排序

      _clearPageSelection(); // 清除当前页选中数据
      // 标记需要默认选中的行
      if (selection.length) {
        _initAllSelection(selection); // 清除保存的所有选中行信息
        _checkRows(selection); // 选中行时会把选中的行重新进行存储
      }

      // 存在默认展开的行，对展开状态进行还原
      expandRows.length && toggleRowsExpansion(expandRows);
    },
    // 获取表格列信息和可过滤列的信息
    _initTable(keepStatus = false) {
      // 获取表格需要展示的列的信息
      this.allColumns = this._collectColumns();
      // 设置可以进行过滤的列的信息
      this._setCanFilterColumns(this.allColumns);
      // 设置分页信息
      !keepStatus && this._initPaginationProps();
    },
    /**
     * 初始化分页信息
     */
    _initPaginationProps() {
      if (this.paginationShow) {
        const { paginationProps, data } = this;
        const { pageSize, currentPage } = paginationProps;
        const innerPaginationProps = {
          ...DefaultProps.paginationProps,
          ...paginationProps
        };

        if (data.length) {
          this.innerTotal = data.length;
        }

        // 如果通过current-page属性设置了currentPage则更新当前页配置信息
        currentPage && (this.innerCurrentPage = currentPage);
        this.currentPage && (this.innerCurrentPage = this.currentPage);
        innerPaginationProps.currentPage = this.innerCurrentPage;

        // 如果通过paginationProps.pageSize或者page-size属性设置了pageSize则更新每页数据条数配置信息
        pageSize && (this.innerPageSize = pageSize);
        this.pageSize && (this.innerPageSize = this.pageSize);
        innerPaginationProps.pageSize = this.innerPageSize;
        const realPageSize = this.innerPageSize;

        // 如果通过page-size设置的分页大小不在表格分页组件支持的分页选项里面，将该分页插入到分页可选项里面
        const { pageSizes } = innerPaginationProps;
        if (!pageSizes.includes(realPageSize)) {
          pageSizes.push(realPageSize);
          pageSize.sort((a, b) => a - b); // 顺序排列
          innerPaginationProps.pageSizes = pageSizes;
        }

        this.innerPaginationProps = innerPaginationProps;
      } else {
        this.innerPageSize = this.curTableData.length || 10;
      }
    },
    /**
     * 搜集并设置哪些列可以过滤
     * @param {Array<Object>} columns 表格列配置
     */
    _setCanFilterColumns(columns) {
      // 含有label且不为空，并且不包含type的列才可过滤（选择列，索引列，展开列不可过滤）
      this.canFilterColumns = columns.filter(({ label, type }) => label && label.trim() && !type);
    },
    /**
     * 收集通过columns定义的和通过el-table-column定义的列
     */
    _collectColumns() {
      const { columns = [], $slots } = this;
      // 收集通过el-table-column模板写的列
      const templateColumns = ($slots.default || [])
        .filter(column => column.componentOptions && column.componentOptions.tag === 'el-table-column')
        .map(column => {
          const { componentOptions, data } = column;
          const { propsData, children } = componentOptions;
          const { attrs = {}, scopedSlots = {}, on = {}, onNative = {} } = data;

          const _attrs = objPropToCamelCase(attrs);
          !children && this.columnCounter++;
          // 将通过模板定义的列转换成ll-table的column配置对象
          return {
            ...propsData,
            ..._attrs,
            scopedSlots,
            on,
            onNative,
            children: this._getChildren(children) // 子节点
          };
        });

      // 所有的列配置
      const allColumns = [...templateColumns, ...columns].map(_c => {
        const c = _c;
        const { type, children } = c;
        if (c.order === undefined) {
          if (type) {
            c['label-class-name'] = 'll-table__type-column';
            // 类型列（selection|index|expand）未设置order时总是排在前面
            c.order = ++this.baseOrder - 100000;
          } else {
            c.order = ++this.baseOrder;
          }
        }
        children ? this._columnMountCalc(children) : this.columnCounter++;

        return c;
      });

      const hasEmpty = allColumns.some(item => !item.prop && !item.type);
      hasEmpty && this.columnFilterable && console.warn('[ll-table]: 开启列过滤时，列的prop属性不能重复。');

      return this._getSortedColumns(allColumns, 'order'); // 获取排序后的列信息，按order正序排列
    },
    /**
     * 表格列按升序排列
     * @param {Array<Column>} columns 表格列配置集合
     * @param {String} prop 排序属性
     * @returns {Array<Column>} 排序后的表格列配置集合
     */
    _getSortedColumns(columns, prop) {
      const sortedColumns = sortObjectArrayByProp(cloneDeep(columns), prop);
      sortedColumns.forEach(column => {
        const { children } = column;
        // 分级表格列支持排序
        if (children && children.length > 1) {
          column.children = sortObjectArrayByProp(children, prop);
        }
      });

      return sortedColumns;
    },
    /**
     * 多级表头模式，获取多级列的子列信息
     * @param {Array<Object>} chds 子列信息
     */
    _getChildren(chds) {
      const collectChd = [];
      if (chds) {
        for (const c of chds) {
          const { componentOptions, data = { attrs: {} } } = c;
          const { propsData, children, tag } = componentOptions;
          if (children && tag === 'el-table-column') {
            collectChd.push({
              ...propsData,
              ...data.attrs,
              children: this._getChildren(children)
            });
          } else {
            collectChd.push({ ...propsData, ...data.attrs });
          }
        }
      }

      return collectChd;
    },
    /**
     * 统计表格列数量
     * @param {Array<Object>} chds 一级表格列
     */
    _columnMountCalc(chds) {
      for (const c of chds) {
        const { children } = c;
        children && children.length ? this._columnMountCalc(children) : this.columnCounter++;
      }
    },
    /**
     * 合并行列
     * @param {Object} scope 作用域对象
     * @returns
     */
    _spanMethod(scope) {
      let { columnIndex } = scope;
      const userSpanMethod = this.$attrs['span-method'] || this.$attrs.spanMethod;

      // 用户传入的合并行列方法
      if (userSpanMethod) {
        return userSpanMethod(scope);
      }

      // 表格可过滤时合并倒数第二列和过滤列（最后一列）
      else if (this.columnFilterable && columnIndex === this.colspanColumnFix) {
        return {
          colspan: 2,
          rowspan: 1
        };
      }
    },
    _handleSizeChange(size) {
      this.innerPageSize = size;
    },
    _handlePrevClick(page) {
      this.$emit('prev-click', page);
    },
    _handleNextClick(page) {
      this.$emit('next-click', page);
    },
    _handleCurrentChange(page) {
      this.innerCurrentPage = page;
    },
    /**
     * 勾选行数据时进行深度选中，遍历子节点，同步勾选；返回被操作的行数据集合
     * @param {Array<Object>} rows 待操作的行数据集合
     * @param {Boolean} checked 是否选中
     * @param {Array<Object>} changeRows 无需填写，中间变量，保存操作过的行数据集合
     * @returns {Array<Object>} changeRows 操作过的行数据集合
     */
    _deepSelectRows(rows, checked, changeRows = []) {
      const _rows = isArray(rows) ? rows : [rows];
      _rows.forEach(row => {
        const { children } = row;
        // 标记行选中状态
        this.toggleRowSelection(row, checked);
        // 保存操作的行数据
        changeRows.push(row);

        isArray(children) && children.length && this._deepSelectRows(children, checked, changeRows);
      });

      return changeRows;
    },
    /**
     * 处理选中、取消选中的数据，返回处理过的selection和selectionData的增量数据
     * @param {Array<String>} selection 选中数据的row-key集合
     * @param {Array<Object>} selectionData 选中数据的集合
     * @param {Array<String>} deepSelections 当前行勾选、取消勾选影响到的行数据的row-key集合
     * @param {Array<Object>} deepRows 当前行勾选、取消勾选影响到的行数据的集合
     * @param {Boolean} checked 选中状态
     */
    _processSelectData(selection, selectionData, deepSelections, deepRows, checked) {
      let _selection = selection;
      let _selectionData = selectionData;

      // 选中行
      if (checked) {
        _selection.push(...deepSelections);
        _selectionData.push(...deepRows);
      } else {
        _selection = _selection.filter(item => !deepSelections.includes(item));
        _selectionData = _selectionData.filter(
          row => !deepSelections.includes(getRowIdentity(row, this.rowKey))
        );
      }

      _selection = _selection.filter((k, idx, arr) => {
        if (arr.indexOf(k) === idx) {
          return true;
        }

        _selectionData.splice(idx, 1); // 删除重复数据
        return false;
      });

      return {
        selection: _selection,
        selectionData: _selectionData
      };
    },
    /**
     * 劫持表格行选中，保存选中行的信息
     * @param {Array<Object>} rows 表格所在页选中的行数据
     * @param {Object} row 当前选中行数据
     * @param {Boolean} isChecked 当前行是否选中，同时也隐式表面是_selecelAll函数在调用
     */
    _select(rows, row, isChecked) {
      const { rowKey, paginationSelectable } = this;
      // 当前勾选行的rowKey值
      const keyVal = getRowIdentity(row, rowKey);
      const checked =
        isChecked !== undefined ? isChecked : rows.map(r => getRowIdentity(r, rowKey)).includes(keyVal);
      let deepSelections = [keyVal];
      let deepRows = [row];

      // 单选行才执行，全选操作不执行
      // or 开启了深度选中功能，在点击行时选中行的子节点
      if (this.deepSelect) {
        const { children } = row;
        // 是否勾选的父节点
        const isSelectParentNode = isArray(children);

        // 勾选的父节点，同步勾选子节点
        if (isSelectParentNode) {
          deepRows = this._deepSelectRows(row, checked);
          deepSelections = deepRows.map(r => getRowIdentity(r, rowKey));
        }
      }

      // 支持分页选中行，保存分页选中数据
      if (paginationSelectable) {
        const { allSelection, allSelectionData } = this;
        const { selection, selectionData } = this._processSelectData(
          allSelection,
          allSelectionData,
          deepSelections,
          deepRows,
          checked
        );

        this.allSelection = selection;
        this.allSelectionData = selectionData;
      }

      // 保存当前页选中数据
      const { pageSelection, pageSelectionData } = this;
      const { selection, selectionData } = this._processSelectData(
        pageSelection,
        pageSelectionData,
        deepSelections,
        deepRows,
        checked
      );
      this.pageSelection = selection;
      this.pageSelectionData = selectionData;

      // 不是点击全选选中，单独点击行选中时，透传select事件并发送自定义事件
      if (isChecked === undefined) {
        this.$emit('select', rows, row); // 透传select事件

        const realSelection = paginationSelectable ? this.allSelection : this.pageSelection;
        const realSelectionData = paginationSelectable ? this.allSelectionData : this.pageSelectionData;
        this.$emit('update:selection', realSelection);
        this.$emit('update:selectionData', realSelectionData);
      }
    },
    /**
     * 劫持表格行全选，保存选中行信息
     * @param {Array<Object>} rows 选中的行数据
     */
    _selectAll(rows) {
      let isSelectAll;
      const { curTableData, rowKey, deepSelect } = this;

      // 选中条目为0，说明是取消全选
      if (rows.length === 0) {
        isSelectAll = false;
      } else {
        // 判断选中条目和当前表格页数据长度是否相等，相等说明是全选
        isSelectAll = rows.length === this.curTableData.length;

        // 初步判断是非全选，则进行深度比对判断是否是全选
        // 开启了深度选中和分页选中时就需要走该判断来得到是全选还是取消全选
        if (!isSelectAll) {
          const dataKeys = curTableData.map(row => row[rowKey]);
          const selectedKeys = rows.map(row => row[rowKey]);
          isSelectAll = dataKeys.every(key => selectedKeys.includes(key));
        }
      }

      this._clearPageSelection();

      curTableData.forEach(row => {
        // 深度选中开启，则选中节点的子节点，传入当前页数据
        this._select(deepSelect ? curTableData : rows, row, isSelectAll);
      });

      // 透传select-all事件
      this.$emit('select-all', rows);

      // 触发自定义事件，更新绑定的selection和selection-data
      const { paginationSelectable, allSelection, pageSelection, allSelectionData, pageSelectionData } = this;
      const realSelection = paginationSelectable ? allSelection : pageSelection;
      const realSelectionData = paginationSelectable ? allSelectionData : pageSelectionData;
      this.$emit('update:selection', realSelection);
      this.$emit('update:selectionData', realSelectionData);
    },
    /**
     * 劫持表格选中数据变更事件，这里主要是对响应进行了防抖操作，参见created钩子里面的处置
     * @param {Object<String>} selection 选中的数据row-key集合
     */
    _selectionChange(selection) {
      // 透传事件
      this.$emit('selection-change', selection);
    },
    /**
     * 选中表格数据
     * @param {Array<String>} selections 待选中的row-key集合
     * @param {Array<Object>} [rows = this.curTableData] 表格数据对象数组
     */
    _checkRows(selections, rows = this.curTableData) {
      const { paginationSelectable, rowKey } = this;

      // 标记选中项
      rows.forEach(row => {
        const { children } = row;
        const rowId = getRowIdentity(row, rowKey);
        const checked = selections.includes(rowId);

        this.toggleRowSelection(row, checked);

        // 存储当前页哪些被选中
        if (checked) {
          if (!this.pageSelection.includes(rowId)) {
            this.pageSelection.push(rowId);
            this.pageSelectionData.push(row);

            if (paginationSelectable) {
              const target = getObjArrayItemByKeyValue(
                this.allSelectionData,
                rowKey,
                rowId,
                'children',
                false
              );
              // 保存选中的数据
              !target && this.allSelectionData.push(row);
            }
          }
        } else {
          const idx = this.pageSelection.indexOf(rowId);
          if (idx > -1) {
            this.pageSelection.splice(idx, 1);
            this.pageSelectionData.splice(idx, 1);
          }
        }

        // 存在子节点，遍历子节点
        isArray(children) && this._checkRows(selections, children);
      });
    },
    /**
     * 点击展开时的响应方法，对展开事件进行劫持，完成树形表格展开子节点时对展开的节点进行记录
     * @param {Object} row 展开行
     * @param {Array|Boolean} expandRows 数组或布尔值，展开的是行数据时得到数组，展开的是树节点时得到布尔值
     */
    _expandChange(row, expandRows) {
      // 树形表格，记录被展开的节点row-key
      if (isBoolean(expandRows)) {
        const rowId = getRowIdentity(row, this.rowKey);
        const isExpand = this.innerExpandRowKeys.includes(rowId);

        expandRows
          ? !isExpand && this.innerExpandRowKeys.push(rowId)
          : isExpand && this.innerExpandRowKeys.splice(this.innerExpandRowKeys.indexOf(rowId), 1);

        this.$emit('update:expandRows', this.innerExpandRowKeys);
      }

      // 透传事件
      this.$emit('expand-change', row, expandRows);
    },
    /**
     * @override 代理用户配置的load属性，劫持异步加载到的表格数据
     * @param {Object} row 行数据
     * @param {Object} treeNode 节点信息
     * @param {Function} resolve 加载完毕的回调函数，返回加载的数据
     * @returns {Promise}
     */
    _load(row, treeNode, resolve) {
      const { $attrs, rowKey, curTableData } = this;
      const { load } = $attrs;
      const { childrenKey } = this._getTreePropsKey();
      const _resolve = appendedData => {
        const targetRow = getObjArrayItemByKeyValue(curTableData, rowKey, row[rowKey], childrenKey);
        if (targetRow) {
          const { item } = targetRow;
          this.$set(item, childrenKey, appendedData); // 为curTableData追加节点数据
          this.$emit('update:data', curTableData);
        }

        resolve(appendedData);
      };

      return load(row, treeNode, _resolve);
    },
    /**
     * 处理拖动排序，更新列表信息
     * @param {Array<String>} sortedData 排序后的列，由列label信息组成
     */
    _handlerDragSort(sortedData) {
      const { allColumns } = this;
      allColumns.map(column => {
        sortedData.map((label, index) => {
          if (label === column.label) {
            column.order = index;
          }
        });
      });

      this.allColumns = this._getSortedColumns(allColumns, 'order');
      this._setCanFilterColumns(this.allColumns);

      this.$emit('column-sort-change', this.allColumns, sortedData);
      this.$emit('column-sort', this.allColumns, sortedData);
    },
    /**
     * 获取表格列拖动排序方式
     * @returns {'thead' | 'formItem'}
     */
    _getDragMode() {
      return this.dragSortMode || DefaultProps.dragSortMode;
    },
    /**
     * 劫持row-class-name属性配置
     * @param {Object} scope 行数据对象
     */
    _rowClassName(scope) {
      const customRowClassName = this.$attrs.rowClassName || this.$attrs['row-class-name'];
      const { childrenKey, hasChildrenKey } = this._getTreePropsKey();
      const { row } = scope;
      const rowId = getRowIdentity(row, this.rowKey);
      const hasChildren = row[hasChildrenKey] || (childrenKey && row[childrenKey] && row[childrenKey].length);
      let rowClassName = hasChildren ? getExpandableUniqueClassName(rowId) : '';

      // 用户配置了表格的row-class-name属性
      if (customRowClassName) {
        // 注意空格不能删
        rowClassName += ` ${
          typeof customRowClassName === 'string' ? customRowClassName : customRowClassName(scope)
        }'}`;
      }

      return rowClassName;
    },
    /**
     * 发送单元格编辑事件
     */
    _emitDataEdit() {
      if (this.editable) {
        const { curTableData, originData } = this;
        // 静态表格
        if (originData) {
          this._handlerStaticDataChange(curTableData);
        } else {
          // 动态表格
          this.$emit('update:data', curTableData); // 同步表格绑定的data
          this.$emit('data-edit', curTableData); // 发送表格数据编辑事件
        }
      }
    },
    /**
     * 劫持页头样式设置，处理样式
     * @param {Object} scope 作用域信息
     * @returns
     */
    _headerCellStyle(scope) {
      const { columnIndex } = scope;
      const userHeaderCellStyle = this.$attrs['header-cell-style'] || this.$attrs.headerCellStyle;

      if (userHeaderCellStyle) {
        return userHeaderCellStyle(scope);
      }
      // 取消倒数第二列的右边框
      else if (
        this.columnFilterable &&
        this.$attrs.border !== undefined &&
        columnIndex === this.colspanColumnFix
      ) {
        return {
          'border-right': 'none'
        };
      }
    },
    async _handleDomLoaded(counter = 1) {
      if (counter > 20) {
        return this.$emit('ll-table:mounted');
      }
      await sleep(100);
      if (document.readyState === 'complete') {
        this.$emit('ll-table:mounted');
      } else {
        this._handleDomLoaded(counter + 1);
      }
    }
  },
  render(h, ...args) {
    /**
     * 渲染列函数
     * @param {Object} propsData 列属性对象
     * @param {Boolean} hasChildren 是否是多级表头的子列
     * @returns {JSX}
     */
    const _renderColumn = (h, propsData, hasChildren = false) => {
      const { render, header, scopedSlots = {}, on, onNative, children, ...props } = propsData;
      const { prop, type, order, editable = this.editable } = propsData;
      const thClassName = `${TH_BASE_CLASS}${prop || type}`; // 给表头列加上唯一的的class
      const tdClassName = `${TD_BASE_CLASS}${prop || type}`; // 给表格列加上唯一的的class
      let { className, labelClassName } = props;
      className = className ? `${className} ${tdClassName}` : tdClassName;
      labelClassName = labelClassName ? `${labelClassName} ${thClassName}` : thClassName;
      labelClassName = hasChildren ? `${labelClassName} ll-table__column--children` : labelClassName;
      const propData = {
        props: {
          ...props,
          className,
          labelClassName
        },
        on,
        onNative
      };
      const key = order || prop || type;
      const _scopedSlots = { ...scopedSlots }; // 解除引用

      // 未使用el-table-column定义单元格模板（template和render不会同时存在）
      if (!_scopedSlots.default) {
        // 用户定义了渲染函数
        if (render) {
          _scopedSlots.default = scope => <Render render={render} {...scope}></Render>;
        }
        // 表格单元格可编辑
        else if (editable && !specialColumns.includes(type)) {
          _scopedSlots.default = scope => (
            <Render render={editableRender(prop, propsData, DefaultProps)} {...scope}></Render>
          );
        }
        // 增加全文检索模式，需要在doRequest的参数中传入searchType === 'fullText‘
        else if (type !== 'selection' && this.extraParams && this.extraParams.searchType === 'fullText') {
          _scopedSlots.default = scope => <Render render={highLightTransfer} {...scope}></Render>;
        }
      }

      // 自定义了渲染表头的渲染函数
      if (header) {
        _scopedSlots.header = scope => <Render render={header} {...scope}></Render>;
      }

      propData.scopedSlots = _scopedSlots;

      // 多级表头
      if (children && children.length) {
        return (
          <el-table-column {...propData} key={key}>
            {children.map(c => {
              return _renderColumn(h, c, true);
            })}
          </el-table-column>
        );
      }

      // 单级表头
      return <el-table-column {...propData} key={key}></el-table-column>;
    };

    // 渲染表格数据为空时的提示内容
    const _renderEmptySlot = () => {
      const { $slots } = this;
      const { emptySlot } = DefaultProps;
      // 通过插槽配置了无数据时的展示信息，单独配置slot优先级高
      if ($slots.empty) {
        return $slots.empty;
      }
      // 全局配置了表格数据为空时的展示内容
      else if (emptySlot) {
        return ($slots.empty = isFunction(emptySlot) ? emptySlot(h, ...args) : emptySlot);
      }

      return null;
    };

    // el-table props
    const tableProps = {
      ...this.$attrs,
      data: this.curTableData,
      'row-key': this.rowKey,
      'span-method': this._spanMethod, // 代理劫持表格的span-method属性配置
      'header-cell-style': this._headerCellStyle,
      'row-class-name': this._rowClassName
    };

    const { load, lazy } = this.$attrs;
    if (this.rowDraggable && lazy !== undefined && load) {
      tableProps.load = this._load; // 代理load属性配置
    }

    const layoutMap = {
      tool: this.toolBarShow ? (
        <div class='ll-table__toolBar'>
          {this.$scopedSlots['tool']({
            selection: this.pageSelection,
            selectionData: this.pageSelectionData,
            allSelection: this.allSelection,
            allSelectionData: this.allSelectionData,
            params: this.innerParams || {}
          })}
        </div>
      ) : null,
      table: (
        <div class={'ll-table__table'}>
          <el-table
            ref='elTable'
            {...{
              props: tableProps,
              on: {
                ...this.$listeners,
                select: this._select,
                'select-all': this._selectAll,
                'selection-change': this._selectionChange,
                'expand-change': this._expandChange
              },
              class: { 'll-table__row-draggable': this.rowDraggable },
              directives: [
                this._getDragMode() === 'thead'
                  ? {
                      name: 'dragable',
                      value: {
                        dragable: this.dragSortable, // 是否可拖动
                        dragSelector: '.el-table__header-wrapper th .cell', //绑定拖动事件的元素
                        // 不能绑定拖动事件的元素，根据类名查找
                        excludeSelector: [
                          'll-table__action-column',
                          'll-table__type-column',
                          'll-table__filter-column',
                          'll-table__column--children'
                        ],
                        rebind: true, // 重新绑定事件
                        instance: this
                      }
                    }
                  : {},
                this._server ? { name: 'loading', value: this.innerLoading } : {},
                !this.$attrs['max-height'] && this.autoHeight
                  ? {
                      name: 'resize',
                      value: {
                        fixHeight: this.fixHeight,
                        minHeight: this.minHeight,
                        paginationFixedOnButtom: this.paginationFixedOnButtom,
                        instance: this
                      }
                    }
                  : {}
              ]
            }}>
            {this.tableColumns &&
              this.tableColumns.map(prop => {
                return _renderColumn(h, prop);
              })}
            {this._renderActionColumn(h)}
            {this._renderFilterForm(h)}
            {/* empty slot */}
            {_renderEmptySlot()}
            {/* append slot */}
            {this.$slots.append}
          </el-table>
        </div>
      ),
      extra: this.extraShow ? <div class={'ll-table__extra'}>{this.$slots.extra}</div> : null,
      pagination:
        // 配置了需要分页栏 && 数据总数大于每页展示数
        this.paginationShow && this.innerTotal ? (
          <el-pagination
            ref='elPagination'
            class={'ll-table__pagination'}
            {...{
              props: {
                background: true,
                ...this.innerPaginationProps,
                total: this.innerTotal,
                // 分页布局
                layout: isFunction(this.innerPaginationProps.layout)
                  ? this.innerPaginationProps.layout(this.innerTotal, this.innerPageSize)
                  : this.innerPaginationProps.layout
              },
              on: {
                'size-change': this._handleSizeChange,
                'prev-click': this._handlePrevClick,
                'next-click': this._handleNextClick,
                'current-change': this._handleCurrentChange
              }
            }}>
            {
              <div class={'ll-table__pagination-extra'}>
                {/* 提供插槽供用户自定义分页栏内容 */}
                {this.$scopedSlots['pagination'] &&
                  this.$scopedSlots['pagination']({
                    selection: this.pageSelection,
                    selectionData: this.pageSelectionData,
                    allSelection: this.allSelection,
                    allSelectionData: this.allSelectionData,
                    params: this.innerParams || {}
                  })}
              </div>
            }
          </el-pagination>
        ) : null
    };
    return (
      <div class={['ll-table', this.customTableClass, this.tcdLayout ? 'll-table-tcd' : '']}>
        {this.layouts.map(layout => layoutMap[layout])}
      </div>
    );
  }
};
