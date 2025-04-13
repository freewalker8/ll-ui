import { debounce } from 'lodash-es';
import DefaultProps from '../config';
import { TH_BASE_CLASS } from '../config/const';
import { sleep } from '../../../utils/util';

function getProps(columns) {
  return columns.map(c => c.prop || c.type).filter(p => !!p);
}

/**
 * 获取隐藏列在当前展示列中的索引
 * @param {Array<String>} tableColumnsProps 当前展示列的prop（没prop时是type）集合
 * @param {Array<String>} seachAscColumnsProps 隐藏列查找范围（按权重优先级排序，优先隐藏的在前面）
 */
function getHiddenColumnIndex(tableColumnsProps, seachAscColumnsProps) {
  const hiddenColumnProp = seachAscColumnsProps.find((prop, idx) => {
    const find = tableColumnsProps.includes(prop);
    if (find) {
      seachAscColumnsProps.splice(idx, 1); // 已经隐藏的列从查找范围删除
      return true;
    }
    return false;
  });

  return tableColumnsProps.indexOf(hiddenColumnProp); // 返回隐藏列在展示表格列中的索引
}

export default {
  props: {
    // 是否不展示横向滚动条，内容超长时自动隐藏部分列
    disableHScroll: {
      type: Boolean,
      default: undefined
    },
    // 开启不展示横向滚动条时，未自动获取到列宽时列的兜底宽度
    columnWidthFix: {
      type: Number,
      default: 150
    },
    // 计算滚动距离时允许的误差值（偏移量），小于该值认为无滚动条
    scrollOffset: {
      type: Number,
      default: 20
    },
    // 操作列的prop属性值，用于过滤操作（不能隐藏操作列）
    operateColumnProps: {
      type: Array,
      default: () => ['action', 'expand', 'selection'] // 动作列， 展开列， 选择列
    }
  },
  data() {
    return {
      tableWarpDom: null,
      ascHideableColumnProps: [],
      hiddenColumns: [], // 记录哪些列被隐藏了
      hiddenColumnsProps: [],
      tableWarpDomWidth: 0
    };
  },
  computed: {
    isDisableHScroll() {
      const { disableHScroll } = this;
      const isDisableHScroll = disableHScroll === undefined ? DefaultProps.disableHScroll : disableHScroll;
      return isDisableHScroll;
    }
  },
  created() {
    if (this.isDisableHScroll) {
      this.handleTableResize = debounce(this.handleTableResize, 100, { leading: true, trailing: false });

      this.$on('table-resize', this.handleTableResize);

      // document  loaded
      this.$once('ll-table:mounted', () => {
        this.tableWarpDom = this.$el.querySelector('.el-table__body-wrapper');
        this.tableWarpDomWidth = this.tableWarpDom.clientWidth;
        this._setAscHideableColumnProps();
        this.handleTableResize();
      });
    }
  },
  beforeDestroy() {
    this.$off('table-resize', this.handleTableResize);
  },
  methods: {
    /**
     * 监测是否出现了横向滚动条
     * @returns {Boolean}
     */
    async checkHasScrollBar() {
      let counter = 0;
      let hasScrollBar = false;
      const { $el } = this;
      while (counter < 20 && !hasScrollBar) {
        hasScrollBar = !$el.querySelector('.is-scrolling-none');
        counter++;
        await sleep(50);
      }
      return hasScrollBar;
    },
    /**
     * 响应table resize事件
     */
    handleTableResize() {
      this.$nextTick(async () => {
        if (!this.tableWarpDom) return;
        const isEnlarge = this.tableWarpDom.clientWidth > this.tableWarpDomWidth;
        const overflowWidth = this._getHorizontalOverflowScrollWidth(this.tableWarpDom);

        const displayColumns = this._calcDisplayColumns(overflowWidth, isEnlarge);
        this.tableColumns = displayColumns;

        // 再次监测是否出现了横向滚动条
        const hasScrollBar = await this.checkHasScrollBar();
        if (hasScrollBar) {
          this.handleTableResize();
        }

        // 发送隐藏列事件
        this.$emit('hide-columns', this.hiddenColumnsProps, this.hiddenColumns);
      });
    },
    _getHorizontalOverflowScrollWidth(dom) {
      this.tableWarpDomWidth = dom.clientWidth;
      return dom.scrollWidth - dom.clientWidth;
    },
    /**
     * 计算需要显示的列
     * @param {Number} overflowWidth 超过dom容器的宽度值
     * @param {Array<Column>} isEnlarge 是否是放大、拉伸浏览器窗口
     */
    _calcDisplayColumns(overflowWidth, isEnlarge) {
      const { tableColumns, ascHideableColumnProps, columnWidthFix } = this;
      const tableColumnsProps = getProps(tableColumns);
      const searchAscColumnsProps = [...ascHideableColumnProps]; // 优先隐藏的在前面
      let hiddenColumnsWidth = 0; // 记录隐藏列的宽度和
      const displayColumns = isEnlarge ? [...this.allColumns] : [...tableColumns]; // 拉伸放大时，需要显示所有列

      while (hiddenColumnsWidth < overflowWidth - this.scrollOffset) {
        const columnIndex = getHiddenColumnIndex(tableColumnsProps, searchAscColumnsProps); // 获取隐藏列在当前展示列中的索引
        const hideColumn = tableColumns[columnIndex];
        const { width, minWidth, prop, type } = hideColumn;
        const className = prop || type;
        const realProp = className;

        const thDom = this.$el.querySelector(`.${TH_BASE_CLASS}-${className}`); // 获取表头dom
        const thDomWidth = thDom ? thDom.clientWidth : 0;

        // 列宽度获取顺序，通过thDom计算>列配置的width>列配置的minWidth>columnWidthFix（兜底宽度）
        hiddenColumnsWidth += thDomWidth || width || minWidth || columnWidthFix;

        // 记录哪些列被隐藏了
        if (!this.hiddenColumnsProps.includes(realProp)) {
          this.hiddenColumnsProps.push(realProp);
          this.hiddenColumns.push(hideColumn);
        }

        displayColumns.splice(columnIndex, 1, undefined); // 将需要隐藏的列替换为undefined，不直接删除，避免数组长度变化，导致索引错误
      }

      return displayColumns.filter(c => !!c); // 返回需要展示的列
    },
    /**
     * 将表格列按displayWeight正序排列得到新的列标识(prop)集合
     */
    _setAscHideableColumnProps() {
      const { allColumns, operateColumnProps } = this;
      const baseWeight = 10000;

      // 按展示权重正序排列，displayWeight值越小越靠前
      const ascColumns = allColumns
        .filter(({ prop, fixed }) => {
          // 过滤出操作列和固定列，不能隐藏
          return !operateColumnProps.includes(prop) && !fixed;
        })
        .map((column, index) => {
          // 未配置displayWeight属性，设置一个默认值
          if (column.displayWeight === undefined) {
            return { ...column, displayWeight: baseWeight + index + 1 };
          }
          return { ...column };
        })
        .sort((a, b) => {
          // 按displayWeight值正序排列
          return a.displayWeight - b.displayWeight;
        });

      // 获取可以隐藏的列信息，未设置prop时不可隐藏
      this.ascHideableColumnProps = getProps(ascColumns);
    }
  }
};
