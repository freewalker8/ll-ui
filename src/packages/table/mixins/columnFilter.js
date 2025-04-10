import { isUniqueArrayItemEqual } from '../../../utils/util';
import DefaultProps from '../config';

let CHECKED_COLUMNS_BAK = [];

export default {
  props: {
    // 是否可过滤列
    columnFilterable: {
      type: Boolean,
      default: false
    },
    // 选中的列，由column的prop属性组成
    columnFilterSelected: Array,
    // 默认选中的列，不可取消
    columnFilterAlwaysSelected: {
      type: Array,
      default: () => []
    },
    // 过滤表单class
    columnFilterClass: {
      type: String,
      default: 'll-table__filterColumn'
    },
    // 过滤表单宽度
    columnFilterWidth: {
      type: [String, Number],
      default: 440
    },
    // 每行显示的CheckBox数
    columnFilterRowNum: {
      type: Number,
      default: 4,
      validator(v) {
        return 24 % v === 0;
      }
    },
    // 筛选表单操作按钮，支持三种操作，按钮会按照你输入的顺序进行排列
    columnFilterButtonLayout: {
      type: String,
      default: 'cancel, all, reset' // 取消、全选、重置
    },
    // 过滤表单取消按钮文本
    columnFilterCancelLabel: {
      type: String,
      default: '取消'
    },
    // 重置按钮文本
    columnFilterResetLabel: {
      type: String,
      default: '重置'
    },
    // 重置按钮文本
    columnFilterAllLabel: {
      type: String,
      default: '全选'
    },
    // 不包含操作列的最大展示列数，默认最大列数为全部列
    maxColumnNum: Number,
    // 最小展示列
    minColumnNum: {
      type: Number,
      default: 1,
      validator(v) {
        if (v < 1) {
          console.error('[ll-table][error]:minColumnNum must be greater than 0');
          return false;
        }
        return true;
      }
    }
  },
  data() {
    return {
      checkedColumns: [], // 存储过滤表单的选中值，起到缓存作用
      checkedColumnsBak: [],
      filterColumnVisible: false,
      isFiltered: false
    };
  },
  computed: {
    // 最小展示列数
    innerMinColumnNum() {
      const { minColumnNum, columnFilterAlwaysSelected } = this;
      const columnFilterAlwaysSelectedLen = columnFilterAlwaysSelected.length;

      return minColumnNum > columnFilterAlwaysSelectedLen ? minColumnNum : columnFilterAlwaysSelectedLen;
    },
    // 计算最大展示列数
    innerMaxColumnNum() {
      return this.maxColumnNum || this.canFilterColumns.length;
    },
    // 计算字段所占宽度
    cellSpan() {
      return 24 / (this.columnFilterRowNum || DefaultProps.columnFilterRowNum);
    },
    // 计算哪些列字段被选中
    defaultCheckedColumns() {
      const { columnFilterSelected = [], columnFilterAlwaysSelected, canFilterColumns } = this;

      // 默认选中列的长度不为0，则选中设置的默认选中列；否则进行兜底，选中所有可过滤的列
      const checkedColumns = columnFilterSelected.length
        ? columnFilterSelected
        : [...canFilterColumns.map(item => item.prop)];
      const realCheckedColumns = [...checkedColumns, ...columnFilterAlwaysSelected].filter(
        (prop, idx, arr) => !!prop && arr.indexOf(prop) === idx
      );

      return realCheckedColumns;
    }
  },
  watch: {
    defaultCheckedColumns: {
      deep: true,
      immediate: true,
      handler(val) {
        this.checkedColumns = [...val];
      }
    },
    checkedColumns: {
      deep: true,
      handler(checked) {
        // 过滤表格列
        this.tableColumns = this.allColumns.filter(({ prop, type }) => {
          return checked.includes(prop) || !!type;
        });
      }
    }
  },
  methods: {
    /**
     * 渲染过滤器表单
     * @returns
     */
    _renderFilterForm(h) {
      const {
        columnFilterable,
        columnFilterWidth,
        columnFilterClass,
        innerMaxColumnNum,
        innerMinColumnNum,
        cellSpan,
        columnFilterAlwaysSelected
      } = this;

      return columnFilterable ? (
        <el-table-column
          prop='ll-table-filter-column'
          align='center'
          width='40'
          label-class-name='ll-table__filter-column'>
          <template slot='header'>
            <el-popover
              ref='filterColumnPopper'
              placement='left'
              width={columnFilterWidth || DefaultProps.columnFilterWidth}
              popperClass={columnFilterClass + 'll-table__filter-column-warp'}
              {...{
                props: {
                  value: this.filterColumnVisible
                },
                on: {
                  input: val => {
                    const { isFiltered, filterColumnVisible, checkedColumns } = this;
                    // 发生了筛选操作 && 不是初始化 && 筛选内容有变化;则发送筛选完成事件
                    if (
                      isFiltered &&
                      filterColumnVisible &&
                      !val &&
                      isUniqueArrayItemEqual(checkedColumns, CHECKED_COLUMNS_BAK)
                    ) {
                      this.$emit('column-filter-confirm', checkedColumns);
                    }

                    this.filterColumnVisible = val;
                  }
                }
              }}>
              <el-checkbox-group
                ref='filterBox'
                {...{
                  model: {
                    value: this.checkedColumns,
                    callback: this._handleCheckboxChange
                  },
                  props: {
                    min: innerMinColumnNum,
                    max: innerMaxColumnNum
                  },
                  directives: [
                    this._getDragMode() === 'formItem'
                      ? {
                          name: 'dragable',
                          value: {
                            dragable: this.dragSortable,
                            dragSelector: '.el-col',
                            instance: this
                          }
                        }
                      : {}
                  ]
                }}>
                <el-row>
                  {this.canFilterColumns.map(({ label, prop }, index) => {
                    return (
                      <el-col span={cellSpan} title={label} class='ll-table__filter-column-cellbox'>
                        <el-checkbox
                          {...{
                            props: {
                              label: prop,
                              key: prop,
                              disabled: columnFilterAlwaysSelected.includes(prop)
                            }
                          }}>
                          {index + 1}.{label}
                        </el-checkbox>
                      </el-col>
                    );
                  })}
                </el-row>
              </el-checkbox-group>
              {this._renderFilterButton(h)}
              <i slot='reference' class='el-icon-setting ll-table__filter-column-icon'></i>
            </el-popover>
          </template>
        </el-table-column>
      ) : null;
    },
    // 菜单按钮
    _renderFilterButton(h) {
      const btnMap = {
        all: (
          <el-button type='primary' size='mini' onClick={this._handlerFilterAll}>
            {this.columnFilterAllLabel || DefaultProps.columnFilterAllLabel}
          </el-button>
        ),
        reset: (
          <el-button type='primary' size='mini' onClick={this._handlerFilterReset}>
            {this.columnFilterResetLabel || DefaultProps.columnFilterResetLabel}
          </el-button>
        ),
        cancel: (
          <el-button type='default' size='mini' onClick={this._handlerFilterCancel}>
            {this.columnFilterCancelLabel || DefaultProps.columnFilterCancelLabel}
          </el-button>
        )
      };

      let buttons = (this.columnFilterButtonLayout || DefaultProps.columnFilterButtonLayout)
        .split(',')
        .map(b => b.trim());

      return (
        <el-row>
          <el-col span={24}>
            <div class='ll-table__filter-column-button'>{buttons.map(b => btnMap[b])}</div>
          </el-col>
        </el-row>
      );
    },
    // 处理表单选中项的变化
    _handleCheckboxChange(val) {
      this.isFiltered = true;
      this.columnCounter += val.length - this.checkedColumns.length;
      this.checkedColumns = []; // clear
      CHECKED_COLUMNS_BAK = val;

      this.$nextTick(() => {
        val.map((item, idx) => {
          this.$set(this.checkedColumns, idx, item);
        });

        this.$emit('column-filter', this.checkedColumns); // 对我暴露筛选事件，每次筛选触发
      });
    },
    // 关闭表单
    _handlerFilterCancel() {
      this.$refs.filterColumnPopper.showPopper = false;
    },
    // 重置为初始状态
    _handlerFilterReset() {
      const { columnFilterSelected = [] } = this;
      const selectedColumnProps = columnFilterSelected.length
        ? columnFilterSelected
        : this.canFilterColumns.map(item => item.prop);

      this._handleCheckboxChange(selectedColumnProps);

      // 对外暴露重置事件，用于用户用columnFilterSelected属性来自定义重置状态
      this.$emit('column-reset', selectedColumnProps);
    },
    // 选中全部列，但选中的列数不能超过设置的最大显示列（maxColumnNum）
    _handlerFilterAll() {
      this._handleCheckboxChange(this.canFilterColumns.slice(0, this.innerMaxColumnNum).map(c => c.prop));
    }
  }
};
