import { cloneDeep, debounce } from 'lodash-es';
import Sortable from 'sortablejs';
import { flattenArray, unFlattenArray, getRowIdentity, LL_ROW_LEVEL_KEY, LL_ROW_PARENT_KEY } from '../utils';
import { getObjArrayItemByKeyValue } from '../../../utils/util';

export default {
  props: {
    // 表格行是否可拖动
    rowDraggable: {
      type: Boolean,
      default: false
    },
    // 拖拽分组
    dragGroup: {
      type: String,
      default: 'llTable'
    },
    // 定义放置元素的类名称
    ghostClass: {
      type: String,
      default: 'll-table__drag-row--ghostClass'
    },
    // 定义正在被拖动的元素类名称
    chosenClass: {
      type: String,
      default: 'll-table__drag-row--chosen'
    },
    // 拖动组件配置，支持sortablejs的所有配置，如果配置了组件的dragGroup，ghostClass属性，那么他们的值会覆盖通过dragOptions配置的同名属性值
    dragOptions: {
      type: Object,
      default: () => ({})
    },
    // 自行处理排序时抛出的错误信息，给出操作提示
    handleRowSortError: Function
  },
  watch: {
    curTableData: {
      deep: true,
      handler() {
        if (this.rowDraggable) {
          this.setCurTableDataFlatten();
        }
      }
    }
  },
  data() {
    return {
      curTableDataFlatten: [],
      curTableDataFlattenBak: []
    };
  },
  created() {
    this.setCurTableDataFlatten = debounce(this.setCurTableDataFlatten, 50);
    // 行可拖动时将表格数据展平
    if (this.rowDraggable) {
      if (!this.$props['rowKey']) {
        throw new Error(`[ll-table]: 表格行可拖动时，请配置rowKey属性！`);
      }
      this.setCurTableDataFlatten();
    }
  },
  mounted() {
    if (this.rowDraggable) {
      // fix Firefox浏览器，阻止默认的拖动搜索功能
      this.$el.ondrop = function(e) {
        e.preventDefault();
        e.stopPropagation();
      };
      // 确保dom 渲染完成再初始化拖动
      this.$nextTick(() => {
        const dragOptions = {
          amination: 150,
          draggable: '.el-table__row',
          ...this.dragOptions,
          group: {
            name: this.dragGroup
          },
          ghostClass: this.ghostClass,
          chosenClass: this.chosenClass
        };

        Sortable.create(this.$el.querySelector('.el-table__body-wrapper tbody'), {
          ...dragOptions,
          onChoose: () => {
            this._backupCurTableDataFlatten();
          },
          onEnd: evt => {
            const { rowKey, curTableDataFlatten } = this;
            let { oldIndex: fromIndex, newIndex: toIndex } = evt;
            const fromData = curTableDataFlatten[fromIndex];
            const toData = curTableDataFlatten[toIndex];

            // 未拖动形成排序，只是拖动了一行数据
            if (fromData[rowKey] === toData[rowKey]) {
              return;
            }

            this._handleDrag(fromData, toData, fromIndex, toIndex);
          }
        });
      });
    }
  },
  methods: {
    /**
     * 将表格数据展平
     */
    setCurTableDataFlatten() {
      this.curTableDataFlatten = flattenArray(this.curTableData, this.rowKey);
    },
    /**
     * 获取备份的拖动前的数据信息
     * @returns {Array<Object>}
     */
    revertTableData() {
      const curTableData = unFlattenArray(this.curTableDataFlattenBak, this.rowKey, LL_ROW_PARENT_KEY);
      this._setTableData(curTableData);
      return curTableData;
    },
    /**
     * 点击按钮上下移动一个位置排序，将点击处理成拖动，按拖动来统一处理（特殊形式的拖动，一次拖动一个位置）
     * @param {Enumerator('up', 'down')} direction 移动方向，up:向上，down:向下
     * @param {Object} row 被点击行的数据对象
     * @param {Number} $index 被点击行在表格数据中的索引
     */
    rowClickSort(direction, row, $index) {
      const { curTableDataFlatten } = this;
      const fromIndex = $index;
      const toIndex = direction === 'up' ? $index - 1 : $index + 1;
      const fromData = row;
      const toData = curTableDataFlatten[toIndex];

      this._handleDrag(fromData, toData, fromIndex, toIndex);
    },
    /**
     * 拖动数据处理
     * @param {Object} fromData 被拖动行数据
     * @param {Object} toData 被拖动到的位置原行对应的数据
     * @param {Number} fromIndex 被拖动行数据对象在表格数据中的索引
     * @param {Number} toIndex 被拖动到的位置原行对应的数据在表格数据中的索引
     */
    _handleDrag(fromData, toData, fromIndex, toIndex) {
      const { rowKey, curTableDataFlatten, innerExpandRowKeys } = this;
      const goDown = toIndex > fromIndex; // 是否向下拖动
      const fromFix = this._getFromFix(fromData);
      const dragData = curTableDataFlatten.splice(fromIndex, fromFix + 1);
      let behavior = 0; // 拖动行为，0：同层级节点拖动，1：子节点拖动到上级节点，-1：节点拖动为其它节点的子节点
      const level = fromData[LL_ROW_LEVEL_KEY] - toData[LL_ROW_LEVEL_KEY];

      if (level > 0) {
        behavior = 1;
      } else if (level < 0) {
        behavior = -1;
      }

      if (this._isDragDataSon(fromData, toData)) {
        const errorMessage = '拖拽失败，父子点不能拖拽到自己的子节点内';
        if (this.handleRowSortError) {
          this.handleRowSortError('row-sort-error', errorMessage); // 使用用户配置的自定义的错误处理
        } else {
          this.$message.error(errorMessage);
        }

        this.$emit('row-sort-error', errorMessage); // 排除拖动排序错误事件

        return this.revertTableData();
      }
      // 同层级拖动
      else if (behavior === 0) {
        const parentId = getRowIdentity(toData, rowKey);
        // 被拖动节点无子节点
        if (fromFix === 0) {
          // 目标位置节点存在子节点 && 且是向下拖动 && 目标节点展开了
          if (toData.children && goDown && innerExpandRowKeys.includes(parentId)) {
            behavior = -1;
            dragData[0][LL_ROW_PARENT_KEY] = parentId;
          }

          curTableDataFlatten.splice(toIndex, 0, ...dragData);
        }
        // 被拖动节点有子节点
        else if (fromFix) {
          // 目标位置节点存在子节点 && 且是向下拖动 && 目标节点展开了,把拖动节点作为他的子节点
          if (toData.children && goDown && innerExpandRowKeys.includes(parentId)) {
            dragData[0][LL_ROW_PARENT_KEY] = parentId;
            this._expandTargetNode(parentId);
          }

          curTableDataFlatten.splice(goDown ? toIndex - fromFix : toIndex, 0, ...dragData);
        }
      }
      // 目标节点存在父节点（将拖动节点作为其它节点的子节点）
      else if (toData[LL_ROW_PARENT_KEY]) {
        // 在父节点内同级移动
        if (toData[LL_ROW_PARENT_KEY] === fromData[LL_ROW_PARENT_KEY]) {
          if (fromFix === 0) {
            curTableDataFlatten.splice(toIndex, 0, ...dragData);
          }
          // 被拖动节点存在子节点
          else if (fromFix) {
            curTableDataFlatten.splice(goDown ? toIndex - fromFix : toIndex, 0, ...dragData);
          }
        }
        // 将节点移动到一个节点作为其子节点
        else {
          behavior = fromData[LL_ROW_LEVEL_KEY] > toData[LL_ROW_LEVEL_KEY] ? 1 : -1;
          const parentId = toData[LL_ROW_PARENT_KEY];
          for (const item of curTableDataFlatten) {
            // 将节点移动到一个节点作为其子节点
            if (item.children && getRowIdentity(item, rowKey) === parentId) {
              this._expandTargetNode(parentId);
              dragData[0][LL_ROW_PARENT_KEY] = parentId; // 为被拖动节点设置父节点
              // 被拖动节点无子节点
              if (fromFix === 0) {
                curTableDataFlatten.splice(toIndex, 0, ...dragData);
              }
              // 被拖动节点有子节点
              else if (fromFix) {
                curTableDataFlatten.splice(goDown ? toIndex - fromFix : toIndex, 0, ...dragData);
              }
              break;
            }
          }
        }
      }
      // 将节点移动到根节点（提升为一级节点）
      else if (!toData[LL_ROW_PARENT_KEY]) {
        behavior = 1;
        // 被拖动节点无子节点
        if (fromFix === 0) {
          dragData[0][LL_ROW_PARENT_KEY] = '';
          curTableDataFlatten.splice(toIndex, 0, ...dragData);
        }
        // 被拖动节点有子节点
        else if (fromFix) {
          dragData[0][LL_ROW_PARENT_KEY] = '';
          curTableDataFlatten.splice(goDown ? toIndex - fromFix : toIndex, 0, ...dragData);
        }
      }

      const from = { ...dragData[0] };
      const to = { ...toData };
      // 位置不能换，数据还原成树状结构后LL_ROW_PARENT_KEY属性被删除，暴露给用户的from属性需要保留LL_ROW_PARENT_KEY属性
      const curTableData = unFlattenArray(curTableDataFlatten, rowKey, LL_ROW_PARENT_KEY);

      // 抛出排序事件
      this.$emit('row-sort', curTableData, {
        direction: goDown ? 'down' : 'up',
        behavior,
        from,
        to,
        fromIndex,
        toIndex,
        dragData: from
      });
    },
    /**
     * 备份当前表格数据，用于恢复到上一次拖动状态
     */
    _backupCurTableDataFlatten() {
      this.curTableDataFlattenBak = cloneDeep(this.curTableDataFlatten);
    },
    /**
     * 获取拖动行的下标
     * @param {Object} fromData 拖动数据
     * @returns {Number} 下标
     */
    _getFromFix(fromData) {
      let _fromFix = 0;
      const calcFix = data => {
        const { children } = data;
        if (children) {
          _fromFix += children.length;
          children.forEach(row => {
            row.children && calcFix(row);
          });
        }
      };

      calcFix(fromData);

      return _fromFix;
    },
    /**
     * 是否是将父节点拖动到自己的子节点位置
     * @param {Object} fromData 拖动行数据
     * @param {Object} toData 放入位置行数据
     * @returns {Boolean}
     */
    _isDragDataSon(fromData, toData) {
      const result = getObjArrayItemByKeyValue([fromData], this.rowKey, getRowIdentity(toData, this.rowKey));

      return !!result;
    },
    /**
     * 展开父节点
     * @param {String} targetId 父节点的rowKey值
     */
    _expandTargetNode(targetId) {
      !this.innerExpandRowKeys.includes(targetId) && this.innerExpandRowKeys.push(targetId);
    }
  }
};
