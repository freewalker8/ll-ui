import { isObject } from '../../../utils/util';

// 默认分页配置
const DefaultPaginationProps = {
  pageSize: 10,
  pageSizes: [10, 15, 20, 30, 40, 50],
  layout: 'slot, ->, total, sizes, prev, pager, next, jumper'
};

// 默认接口返回数据映射配置，映射接口返回的数据，使组件能正确获取数据
const DefaultPropsMap = {
  data: 'data',
  total: 'total',
  pageSize: 'pageSize',
  currentPage: 'currentPage',
  hideOnSinglePage: false
};

// 表格可全局配置属性的默认值
export const DefaultProps = {
  layout: 'tool, table, extra, pagination', // 表格布局，默认值：tool（工具栏）, table（表格）, extra（附加内容）, pagination（分页栏）
  emptyPlaceholder: '', // String | val => String 单元格内容为空时的占位符，支持配置函数，函数判断是否为空返回占位符；当使用了自定义单元格模板（slot/render）时需自行处理占位符
  emptySlot: '', // String | h => JSX 配置表格没数据时的显示内容，eg: (h) => <div>暂无数据</div>;单独配置了slot插槽时插槽优先级高于全局配置
  // 控制分页组件的属性配置，可配置属性与el-pagination的属性保持一致
  paginationProps: {
    pageSize: 10,
    pageSizes: [10, 15, 20, 30, 40, 50],
    // 下面的为扩展属性
    layout: 'slot, ->, total, sizes, prev, pager, next, jumper', // String | (total: Number, paginationProps.pageSize: Number): String 支持配置函数动态修改分页器布局样式
    hideOnSinglePage: false // 只有一页时是否隐藏分页器
  },
  hideOnSinglePage: false, // 只有一页时是否隐藏分页器
  // 数据映射，映射接口返回的数据，使组件能正确获取数据
  propsMap: {
    data: 'data', // 接口返回数据集合
    total: 'total', // 接口返回数据总条数字段名
    pageSize: 'pageSize', // 每页数据条数字段名
    currentPage: 'currentPage' // 当前页字段名
  },
  // 表格列过滤器相关
  columnFilterWidth: 440, // 列过滤器宽度
  columnFilterRowNum: 4, // 列过滤器每行显示的表格列字段数量
  columnFilterButtonLayout: 'cancel, all, reset', // 取消、全选、重置；列过滤按钮布局，按照顺序进行排列
  columnFilterCancelLabel: '取消', // 取消按钮文本
  columnFilterAllLabel: '全选', // 全选按钮文本
  columnFilterResetLabel: '重置', // 重置按钮文本
  // 可编辑表格相关配置
  enterSave: false, // 表格可编辑时，启用回车提交cell-change事件，保存内容
  saveLabel: '保存', // 保存按钮文本
  cancelLabel: '取消', // 取消按钮文本
  saveMessage: '编辑内容未保存', // 手动触发变更事件时，用户未保存数据时的提示信息
  dragSortModel: 'thead', // 可拖拽排序，thead：拖动表头排序，formItem：在列过滤器里面拖到item排序
  // 禁用水平滚动条，默认关闭；当开启时，表格内容超出容器宽度按表格列配置的displayWeight属性的权重隐藏部分列直到不出现滚动条，优先隐藏权重小的
  disableHScroll: false
};

/**
 * 设置组件属性默认值
 * @param {Object<[prop]: value>} options 组件支持全局配置的属性
 */
const _setProps = (options = {}) => {
  const globalPropArr = Object.keys(options);
  globalPropArr.forEach(prop => {
    if (prop in DefaultProps) {
      const oldPropVal = DefaultProps[prop];
      const newPropVal = options[prop];
      // 可全局设置该属性 && 全局配置该属性
      if (oldPropVal !== undefined && newPropVal !== undefined) {
        if (isObject(newPropVal) && isObject(oldPropVal)) {
          Object.assign(oldPropVal, newPropVal);
        } else {
          // 不考虑array（默认属性是数组时不支持修改），其它类型的值直接覆盖默认值
          DefaultProps[prop] = newPropVal;
        }
      }
    }
  });
};

let timer = null;
let isFirst = true;
let timeout = new Date().getTime();

/**
 * 设置全局配置
 * @param {Object} options 全局配置信息
 * @param {Boolean} debounce 是否防抖
 * @returns
 */
export const setProps = (options, debounce = false) => {
  if (!options) {
    return;
  }

  // 非法参数
  if (!isObject(options) || Object.keys(options).length === 0) {
    console.error(`[ll-form-table][ll-table]:setProps 参数错误，预期为非空对象`);
    return;
  }

  if (debounce) {
    const nowTime = new Date().getTime();
    if (isFirst) {
      _setProps(options);
      isFirst = false;
    } else {
      timer = setTimeout(() => {
        _setProps(options);
        clearTimeout(timer);
        timer = null;
      }, 100);
      // 100ms内只执行最后一次调用
      if (nowTime - timeout < 100) {
        clearTimeout(timer);
        timer = null;
      }
    }
    timeout = nowTime;
  } else {
    _setProps(options);
  }
};

export default DefaultProps;
