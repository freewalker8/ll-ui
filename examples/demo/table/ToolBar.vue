import { serialize } from 'v8';

<template>
  <div class="ll-table-toolbar">
    <div class="ll-table-toolbar__action">
      <el-button type="primary" size="small" @click="$emit('reset')">重置表格</el-button>
      <el-button type="primary" size="small" @click="$emit('clear')">清除选中数据</el-button>
      <el-button size="small" type="primary" @click="$emit('add')">添加</el-button>
      <el-button :loading="innerDeleteLoading" size="small" type="danger" @click="$emit('delete')"
        >删除</el-button
      >
    </div>

    <div class="ll-table-toolbar__search">
      <el-input
        v-model="innerKeyword"
        placeholder="请输入搜索内容"
        size="small"
        clearable
        class="ll-table-toolbar__item width-200"
        @keyup.enter.native="handlerSearch"
      />
      <el-button :loading="innerSearchLoading" size="small" type="primary" @click="handlerSearch"
        >搜索</el-button
      >
    </div>
  </div>
</template>

<script>
export default {
  name: 'ToolBar',
  props: {
    loading: {
      type: Object,
      default() {
        return {
          deleteLoading: false,
          searchLoading: false
        };
      }
    },
    keyword: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      innerKeyword: '',
      innerSearchLoading: false,
      innerDeleteLoading: false
    };
  },
  watch: {
    loading: {
      deep: true,
      immediate: true,
      handler(newVal) {
        this.innerSearchLoading = newVal.searchLoading;
        this.innerDeleteLoading = newVal.deleteLoading;
      }
    },
    keyword: {
      immediate: true,
      handler(newVal) {
        this.innerKeyword = newVal;
      }
    }
  },
  methods: {
    handlerSearch() {
      this.$emit('search', this.innerKeyword);
      this.$emit('update:keyword', this.innerKeyword);
    }
  }
};
</script>

<style lang="scss" scoped>
.ll-table-toolbar {
  margin-bottom: 15px;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  &::after {
    content: '';
    clear: both;
  }

  &__action {
    display: inline-block;
    margin-right: 15px;
    flex: 1;
  }

  &__search {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex: 1;

    .el-button {
      &.el-button--small {
        height: 32px;
      }
    }

    .width-200 {
      flex-basis: 166px;
      flex-grow: 1;
      max-width: 200px;
    }

    & > * {
      margin-right: 10px;
    }
    & > .el-button {
      margin-right: 0;
    }
  }
}
</style>
