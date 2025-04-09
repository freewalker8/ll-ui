import { debounce, get, cloneDeep, isEqual } from 'lodash-es';
import { isArray, isFunction } from '../../../utils/util';
import TableMixin from '../mixins/table';
import DefaultProps from '../config';

export default {
  name: 'LlTable',
  mixins: [TableMixin],
  props: {
    /**
     * 表格数据量，通常动态表格不会填写该属性，只在表格初始化时有用到该属性配置
     */
    total: Number,
    /**
     * 表格是否处于加载数据状态
     */
    loading: {
      type: Boolean,
      default: false
    },
    /**
     * 是否自动调用数据获取方法初始化表格数据，默认为true
     */
    autoInit: {
      type: Boolean,
      default: true
    },
    /**
     * 数据查询函数或http请求实例，用于获取表格数据；当为函数时请返回组件能直接使用的数据，格式为{data,total,pageSize,currentPage}，返回Promise对象
     */
    httpRequest: {
      type: [Function, Object]
    },
    /**
     * 查询参数
     */
    params: {
      type: Object,
      default: () => {}
    },
    /**
     * 数据映射，映射接口返回的数据，使组件能正确的获取数据
     */
    propsMap: {
      type: Object,
      default: () => ({}),
      validator(val) {
        if (Object.keys(val).length && (!val.data || !val.total)) {
          console.error(`[ll-table]:props-map属性配置必须包含'data'和'total'属性`);
          return false;
        }
        return true;
      }
    },
    /**
     * http请求实例，用于发起请求
     */
    fetch: Function
  },
  data() {
    return {
      innerLoading: false,
      curTableData: [],
      curTableDataBak: [],
      extraParams: {},
      innerTotal: 0,
      innerParams: {}
    };
  },
  computed: {
    innerPropsMap() {
      return { ...DefaultProps.propsMap, ...this.propsMap };
    }
  },
  watch: {
    loading(val) {
      this.innerLoading = val;
    },
    data: {
      deep: true,
      immediate: true,
      handler(newData, oldData) {
        if (!isEqual(newData, oldData)) {
          this.curTableData = this.rowDraggable ? cloneDeep(newData) : newData;
          this.curTableDataBak = cloneDeep(newData); // 保存表格数据副本
        }
      }
    },
    params: {
      deep: true,
      immediate: true,
      handler(val) {
        this.innerParams = val;
      }
    },
    innerParams(val) {
      this.$emit('update:params', val);
    },
    total: {
      immediate: true,
      handler(total) {
        let totalPage = total ? Math.ceil(total / this.innerPageSize) : 0;
        if (totalPage === 0) {
          this.innerTotal = 0;
        } else {
          this.innerTotal = total;
          totalPage < this.innerCurrentPage && (this.innerCurrentPage = totalPage);
        }
      }
    }
  },
  created() {
    this._server = true;
    /**
     * 延迟请求，避免频繁请求
     * 当pageSize变化，并且引起currentPage变化时，可以避免重复发起请求
     */
    this.handleHttpRequest = debounce(this._handleHttpRequest, 10);

    if (this.autoInit && this.httpRequest) {
      this._handleHttpRequest();
    }

    // 监听行排序
    this.$on('row-sort', this._setTableData);
  },
  methods: {
    /**
     * @public
     * 发起请求获取数据
     */
    doRequest(extraParams, ...reset) {
      this.extraParams = extraParams;
      this._handleHttpRequest(extraParams, ...reset);
    },
    /**
     * @public
     * 保留查询参数刷新表格
     */
    reload() {
      this.$nextTick(this._handleHttpRequest);
    },
    /**
     * @public
     * 重置表格
     * 如果有自定义的工具栏则需要自己先清除工具栏里面的搜索条件
     */
    resetTable() {
      this._resetTable();
      this.reload();
    },
    /**
     * 设置表格数据
     * @param {Array<Object>} data 表格数据
     */
    _setTableData(data) {
      this.curTableData = []; // clear,触发强制刷新
      this.$nextTick(() => {
        this.curTableData = data;
        this.curTableDataBak = cloneDeep(data);
      });
    },
    /**
     * @private
     * 处理请求,对请求参数进行处理后发起接口查询
     * @param {Object} extraParams 查询参数
     * @param {any} rest 其它请求参数
     * @returns {Promise}
     */
    _handleHttpRequest(extraParams = {}, ...rest) {
      // 获取属性映射的key
      const {
        data: dataKey,
        total: totalKey,
        pageSize: pageSizeKey = 'pageSize',
        currentPage: currentPageKey = 'currentPage'
      } = this.innerPropsMap;

      const { [pageSizeKey]: pageSize, [currentPageKey]: currentPage, ...other } = extraParams;

      const payload = {
        ...other,
        pageSize: pageSize || this.innerPageSize,
        currentPage: currentPage || this.innerCurrentPage
      };

      // 用户传入了分页大小参数
      if (pageSize && pageSize !== this.innerPageSize) {
        this.innerPageSize = pageSize;
      }
      // 用户传入了当前页参数
      if (currentPage && currentPage !== this.innerCurrentPage) {
        this.innerCurrentPage = currentPage;
      }

      this.innerLoading = true;

      return Promise.resolve(this._httpRequest(payload, ...rest))
        .then(res => {
          // 当请求返回时，当前页已经改变（一般出现在快速切换分页时），不做处理，只更新最后一次分页获取的数据
          const isCurrent =
            payload.pageSize === this.innerPageSize && payload.currentPage === this.innerCurrentPage;

          if (!isCurrent) return;

          if (isArray(res)) {
            this.curTableData = res;
          } else {
            // 解析得到表格数据
            let list = get(res, dataKey); // 数据解构，按路径获得表格数据
            if (list === undefined && dataKey !== 'data') {
              // 按data属性再次尝试获取表格数据
              list = get(res, 'data');
            }

            if (isArray(list)) {
              this.curTableData = list;
            } else {
              throw new Error(
                `[ll-table]:获取表格数据失败，请检查表格配置的接口数据映射（props-map）是否正确`
              );
            }

            // 获得数据总数
            let total = get(res, totalKey);
            if (total === undefined && totalKey !== 'total') {
              // 按total属性再次尝试获取数据总数
              total = get(res, 'total');
            }

            if (total !== undefined) {
              this.innerTotal = parseInt(total);
              // 最后一页数据为空时调到上一页
              if (this.curTableData.length === 0 && this.innerCurrentPage > 1) {
                let pages = 1;
                try {
                  /**
                   * 计算有多少页数据，
                   * 这里计算跳到上一页是哪一页，而不是在当前页的基础上减一，
                   * 是为了避免用户输入页码进行跳转时直接减一还是可能获取不到数据，导致发送大量的查询请求
                   */
                  pages = Math.ceil(this.innerTotal / this.innerPageSize) || 1;
                } catch (error) {
                  // do nothind
                }

                this.innerCurrentPage = pages;
                this.innerTotal > 0 && this._handleCurrentChange(pages);
              }
            } else {
              throw new Error(
                `[ll-table]:获取表格数据总数失败，请检查表格配置的接口数据映射（props-map）是否正确`
              );
            }
          }

          // 保存表格数据副本
          this.curTableDataBak = cloneDeep(this.curTableData);
          // 发送数据变更事件
          this.$emit('data-change', {
            [dataKey]: this.curTableData,
            [totalKey]: this.innerTotal,
            [pageSizeKey]: this.innerPageSize,
            [currentPageKey]: this.innerCurrentPage,
            params: this.innerParams
          });

          // 没开启分页选中，重新获取数据时将之前的选中信息清空
          !this.paginationSelectable && this.clearAllSelection();
        })
        .catch(e => {
          console.error(`[ll-table]:获取表格数据失败，详情:${e}`);
          return e;
        })
        .finally(() => {
          this.innerLoading = false;
        });
    },
    /**
     * @private
     * 发起请求分页获取表格数据
     * @param {Object} extraParams 查询参数
     * @param {any} rest 附加请求参数
     * @returns {Promise}
     */
    _httpRequest({ pageSize, currentPage, ...other } = {}, ...rest) {
      const queryInfo = {
        ...other,
        ...this.params,
        ...this.extraParams
      };

      const { pageSize: pageSizeKey, currentPage: currentPageKey } = this.innerPropsMap;

      // 支持级联映射a.b.c
      pageSizeKey && (queryInfo[pageSizeKey.split('.').slice(-1)] = pageSize);
      currentPageKey && (queryInfo[currentPageKey.split('.').slice(-1)] = currentPage);

      this.innerParams = queryInfo;

      // 用户配置了自定义请求数据方法
      if (isFunction(this.httpRequest)) return this.httpRequest(queryInfo, ...rest);

      // 未配置自定义请求数据方法，使用默认的请求方法
      if (this.fetch) {
        const options = { method: 'get', ...this.httpRequest };

        if (options.method === 'get') {
          options.params = Object.assign({}, options.params || {}, queryInfo);
        } else {
          options.data = Object.assign({}, options.data || {}, queryInfo);
        }

        return this.fetch(options).then(res => {
          if (res.status === 200) return res.data;
        });
      } else {
        throw new Error(`[ll-table]:未配置请求方法，请配置fetch实例或自定义httpRequest方法`);
      }
    },
    /**
     * @override
     */
    _handleSizeChange(size) {
      if (this.httpRequest) {
        this._handleHttpRequest({ pageSize: size }, 'size');
      }
      this.innerPageSize = size;
    },
    /**
     * @override
     */
    _handleCurrentChange(page) {
      if (this.httpRequest) {
        this._handleHttpRequest({ currentPage: page }, 'page');
      }
      this.innerCurrentPage = page;
    }
  }
};
