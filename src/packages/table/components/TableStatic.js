/*
 * @Author: lianglei stone.ll@qq.com
 * @Date: 2025-04-02 10:59:59
 * @LastEditors: lianglei stone.ll@qq.com
 * @LastEditTime: 2025-04-08 18:29:14
 * @FilePath: \ll-ui\src\packages\table\components\StaticTable.js
 * @Description: 静态表格
 */
import { cloneDeep, isEqual, debounce } from 'lodash-es';
import Table from '../mixins/table';

export default {
  name: 'LlTableStatic',
  mixins: [Table],
  data() {
    return {
      innerData: [],
      innerTotal: 0,
      curTableData: [],
      curTableDataBak: [],
      originData: null // 保存表格初始数据，重置表格时用于还原表格内容
    };
  },
  watch: {
    // 表格数据变更
    data: {
      deep: true,
      immediate: true,
      handler(newData, oldData) {
        if (!isEqual(newData, oldData)) {
          this.innerData = newData;
          this.innerTotal = newData.length;
          // 可拖动时数据深拷贝
          if (this.rowDraggable) {
            const cloneData = cloneDeep(newData);
            this.innerData = cloneData;
            !this.originData && (this.originData = cloneData);
          }
        }
      }
    },
    innerData: {
      immediate: true,
      handler(newData) {
        this._setCurTableData(newData);
      }
    },
    innerPageSize() {
      this._setCurTableData();
    },
    innerCurrentPage() {
      this._setCurTableData();
    },
    paginationShow() {
      this._setCurTableData();
    }
  },
  created() {
    this._setCurTableData = debounce(this._setCurTableData, 50, { leading: true, trailing: false });
    // 监听排序
    this.$on('row-sort', this._setTableData);
  },
  methods: {
    /**
     * 重置表格
     * @public
     * @param {Array<Object>} tableData 表格数据
     */
    resetTable(tableData) {
      if (this.rowDraggable) {
        this.innerData = tableData || this.originData || [];
      }
      this._resetTable();
    },
    /**
     * 设置表格当前展示数据
     * @param {Array<Object>} pageData 表格数据
     */
    _setTableData(pageData) {
      const data = this.innerData;
      this.$nextTick(() => {
        const { paginationShow, innerCurrentPage, innerPageSize } = this;
        // 有分页
        if (paginationShow) {
          const fixedPage = innerCurrentPage - 1;
          const start = fixedPage * innerPageSize;
          // 删掉当前页数据
          data.splice(start, innerPageSize);
          // 将新的数据添加到被删除数据的位置
          data.splice(start, 0, ...cloneDeep(pageData));

          this.innerData = data;
        } else {
          this.innerData = pageData;
        }
      });
    },
    /**
     * 设置表格当前页展示数据
     * @param {Array<Object>} newData 表格数据
     */
    _setCurTableData(newData) {
      let tableData = newData || this.innerData;
      const { paginationShow, innerCurrentPage, innerPageSize, innerTotal, currentPage } = this;

      if (paginationShow && innerTotal) {
        let ceilTotalPage = Math.ceil(innerTotal / innerPageSize);

        if (innerCurrentPage > ceilTotalPage) {
          console.warn(
            `[ll-table]:当前页码(${currentPage})超过了总页数(${ceilTotalPage})，自动将当前页码设置为了最大页码((${ceilTotalPage})`
          );
          this.innerCurrentPage = ceilTotalPage;
        }

        let from = innerPageSize * (this.innerCurrentPage - 1);
        let to = from + innerPageSize;
        tableData = this.innerData.slice(from, to);
      }

      // 保存表格数据副本
      this.curTableDataBak = cloneDeep(tableData);
      // 设置表格数据
      this.curTableData = []; // clear
      this.$nextTick(() => {
        this.curTableData = tableData;
      });
    },
    /**
     * 处理单元格数据编辑事件
     * @param {Array<Object>} data 表格数据
     */
    _hanlderStaticDataChange(data) {
      const { paginationShow, innerCurrentPage, innerPageSize } = this;

      if (paginationShow) {
        const innerData = cloneDeep(this.innerData);
        const from = innerPageSize * (innerCurrentPage - 1);
        const to = from + innerPageSize;
        innerData.slice(from, to, ...data);
        this.$emit('update:data', innerData); // 同步表格绑定的data
        this.$emit('data-edit', innerData);
      } else {
        this.$emit('update:data', data); // 同步表格绑定的data
        this.$emit('data-edit', data);
      }
    }
  }
};
