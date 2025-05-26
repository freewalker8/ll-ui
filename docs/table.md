
# ll-table 

- [1 概述](#1-概述)
- [2 示例项目](#2-示例项目)
- [3 快速上手](#3-快速上手)
  - [3.1 引入element-ui](#31-引入element-ui)
    - [3.1.1 按需引入](#311-按需引入)
    - [3.1.2 完整引入](#312-完整引入)
  - [3.2 引入ll-table](#32-引入ll-table)
    - [3.2.1 全局配置表格属性](#321-全局配置表格属性)
- [4 基础用法](#4-基础用法)
  - [4.1 ll-table-static静态表格](#41-ll-table-static静态表格)
    - [4.1.1 通过template定义列](#411-通过template定义列)
    - [4.1.2 通过columns属性定义列](#412-通过columns属性定义列)
    - [4.1.3 通过template和columns同时定义](#413-通过template和columns同时定义)
  - [4.2 ll-table动态表格](#42-ll-table动态表格)
    - [4.2.1 propsMap支持数据映射](#421-propsMap支持数据映射)
    - [4.2.1.1 配置完整的propsMap属性映射规则来映射接口返回的数据](#4211-配置完整的propsMap属性映射规则来映射接口返回的数据)
    - [4.2.1.2 只配置propsMap的total和data属性映射数据，自己处理分页信息](#4212-只配置propsMap的total和data属性映射数据，自己处理分页信息)
- [5 组件布局](#5-组件布局)
  - [5.1 表格模块构成](#51-表格模块构成)
  - [5.2 工具栏](#52-工具栏)
  - [5.3 表格](#53-表格)
    - [5.3.1 数据展示区](#531-数据展示区)
    - [5.3.2 工作列区](#532-工作列区)
      - [5.3.2.1 动作列actionColumn](#5321-动作列actionColumn)
      - [5.3.2.2 筛选排序列](#5322-筛选排序列)
        - [5.3.2.2.1 筛选](#53221-筛选)
        - [5.3.2.2.2 拖动排序](#53222-拖动排序)
    - [5.3.3 表格高度自适应](#533-表格高度自适应)
    - [5.3.4 禁用表格横向滚动条](#534-禁用表格横向滚动条)
  - [5.4 附加内容](#54-附加内容)
  - [5.5 分页栏](#55-分页栏)
    - [5.5.1 分页栏固定到页面底部](#551-分页栏固定到页面底部)
- [6 高阶用法](#6-高阶用法)
  - [6.1 表格排序](#61-表格排序)
    - [6.1.1 静态排序](#611-静态排序)
    - [6.1.2 后端排序](#612-后端排序)
    - [6.1.3 表格行拖动排序](#613-表格行拖动排序)
  - [6.2 表格过滤](#62-表格过滤)
  - [6.3 表格行选中](#63-表格行选中)
    - [6.3.1 当前页选中](#631-当前页选中)
    - [6.3.2 分页选中](#632-分页选中)
    - [6.3.3 深度选中](#633-深度选中)
  - [6.4 表格列排序](#64-表格列排序)
  - [6.5 多级表头](#65-多级表头)
  - [6.6 动态增减表格列](#66-动态增减表格列)
  - [6.7 表格行展开](#67-表格行展开)
  - [6.8 可编辑表格](#68-可编辑表格)
- [7 组件属性详解](#7-组件属性详解)
  - [7.1 静态表格和动态表格公用的属性](#71-静态表格和动态表格公用的属性)
    - [7.1.1 列过滤相关属性](#711-列过滤相关属性)
    - [7.1.2 行拖动相关属性](#712-行拖动相关属性)
  - [7.2 动态表格特有的属性](#72-动态表格特有的属性)
  - [7.3 列属性扩展](#73-列属性扩展)
- [8 组件暴露的事件](#8-组件暴露的事件)
  - [8.1 数据变更事件](#81-数据变更事件)
  - [8.2 分页变更事件](#82-分页变更事件)
  - [8.3 列过滤变更事件](#83-列过滤变更事件)
  - [8.4 拖动表头对列排序完成时对外暴露的事件](#84-拖动表头对列排序完成时对外暴露的事件)
  - [8.5 拖动行排序完成时对外暴露的事件](#85-拖动行排序完成时对外暴露的事件)
- [9 组件暴露的方法](#9-组件暴露的方法)
- [10 插槽](#10-插槽)
  - [10.1 具名插槽-slot](#101-具名插槽-slot)
  - [10.2 作用域插槽-scopedSlot](#102-作用域插槽-scopedSlot)

## 1 概述

===

> 基于`Element-ui 2.x`的一个易用、可自定义、带分页功能的`Table`组件，你可以像使用`el-table`一样使用本组件，支持全部原生功能和属性
> 本组件是基于[`element-ui`](http://element-cn.eleme.io/2.0/#/zh-CN)的封装，是它的高阶组件

以`npm`包和`umd`资源形式对外发布。

组件目的在于简化`Table`和`Pagination`的使用，提供**自动分页**、**快捷生成数据列**、**快速生成操作列**、**列过滤**、**列排序**、
**工具栏支持传入作用域插槽**、**表格高度自适应**等功能。

包含支持动态数据的`ll-table`组件和静态数据的`ll-table-static`组件。

在一些业务场景中，数据列表缓存在前台，此时数据分页与过滤均发生在前台，`ll-table-static`适用于这种场景。

在另外一些场景中，数据量较大，数据分页及过滤发生在后端，此时`ll-table`适用于这种场景。

如没有特殊说明，后文中的`ll-table`统指`ll-table`和`ll-table-static`

## 2 示例项目

运行`npm install`安装依赖包，然后运行`npm run serve`查看示例项目。示例项目放在`examples`目录。

## 3 快速上手

请先安装[Vue 2.x](https://cn.vuejs.org/)和[Element-ui 2.x](http://element-cn.eleme.io/2.0/#/zh-CN).

### 3.1 引入element-ui

#### 3.1.1 按需引入

参见element-ui文档。

#### 3.1.2 完整引入

```js
import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI);
```

### 3.2 引入ll-table

全局注册：

```js
import Vue from 'vue';
import llTable from 'll-table';

Vue.use(llTable);
// or
Vue.component(llTable.name, llTable);
```

局部注册：

```js
import llTable from 'll-table';

export default {
  components: {
    llTable
  }
}
```
#### 3.2.1 全局配置表格属性

`ll-table`组件支持全局配置表格属性，只需在注册时传入`options`参数即可，可配置的属性见下面示例所示，按需配置。

```js
import Vue from 'vue';
import LlTable from 'll-form-table/src/packages/table';

Vue.use(LlTable, {
  // 表格布局，默认值：tool（工具栏）, table（表格）, extra（附加内容）, pagination（分页栏）
  layout: 'tool, table, extra, pagination',
  // String | val => String 单元格内容为空时的占位符，支持配置函数，函数判断是否为空返回占位符；当使用了自定义单元格模板（slot/render）时需自行处理占位符
  emptyPlaceholder: '',
  // String | h => JSX 配置表格没数据时的显示内容，eg: (h) => <div>暂无数据</div>;单独配置了slot插槽时插槽优先级高于全局配置
  emptySlot: '', 
  // 控制分页组件的属性配置，可配置属性与el-pagination的属性保持一致
  paginationProps: {
    pageSize: 10,
    pageSizes: [10, 15, 20, 30, 40, 50],
    // 下面的为扩展属性
    // String | (total: Number, paginationProps.pageSize: Number): String 支持配置函数动态修改分页器布局样式
    layout: 'slot, ->, total, sizes, prev, pager, next, jumper',
    // 只有一页时是否隐藏分页器
    hideOnSinglePage: false 
  },
  // 只有一页时是否隐藏分页器
  hideOnSinglePage: false,
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
});
```

如果使用的是`umd`资源，可以显示调用`setProps`方法来全局配置表格的属性。

```js
// umd资源
llFormTable.LlTable.setProps({
  // 全局配置 
  // 数据映射，映射接口返回的数据，使组件能正确获取数据
  propsMap: {
    data: 'data', // 接口返回数据集合
    total: 'total', // 接口返回数据总条数字段名
    pageSize: 'pageSize', // 每页数据条数字段名
    currentPage: 'currentPage' // 当前页字段名
  },
})
```

## 4 基础用法
### 4.1 ll-table-static静态表格

#### 4.1.1 通过template定义列

```html
<ll-table-static :data="tableData">
  <el-table-column prop="date" label="日期" width="180"></el-table-column>
  <el-table-column prop="name" label="姓名" width="180"></el-table-column>
</ll-table-static>
<script>
export default {
  data() {
    return {
      tableData: [
        { name: '张三', age: 20 },
        { name: '李四', age: 25 }
      ]
    };
  }
};
</script>
```

#### 4.1.2 通过columns属性定义列

```html
<template>
  <ll-table-static :data="tableData" :columns="columns"></ll-table-static>
</template>

<script>
export default {
  data() {
    return {
      tableData: [
        { name: '张三', age: 20 },
        { name: '李四', age: 25 }
      ],
      columns: [
        { prop: 'name', label: '姓名' },
        { prop: 'age', label: '年龄' }
      ]
    };
  }
};
</script>
```

#### 4.1.3 通过template和columns同时定义

```html
<template>
  <ll-table-static :data="tableData" :columns="columns">
    <el-table-column prop="address" label="地址"></el-table-column>
  </ll-table-static>
</template>

<script>
export default {
  data() {
    return {
      tableData: [
        { name: '张三', age: 20, address: '北京' },
        { name: '李四', age: 25, address: '上海' }
      ],
      columns: [
        { prop: 'name', label: '姓名' },
        { prop: 'age', label: '年龄' }
      ]
    };
  }
};
</script>
```

### 4.2 ll-table动态表格

表格数据通过接口动态获取，需要使用`ll-table`组件。

#### 4.2.1 propsMap支持数据映射

`ll-table`组件支持通过`propsMap`属性来映射接口返回的数据，使组件能正确获取数据。

`propsMap`属性是一个对象，包含以下属性：

- `data`：接口返回数据集合的字段名，默认为`data`。
- `total`：接口返回数据总条数字段名，默认为`total`。
- `pageSize`：每页数据条数字段名，默认为`pageSize`。
- `currentPage`：当前页字段名，默认为`currentPage`。

::: tip 提示
`propsMap`支持级联属性，如`propsMap.data`，`propsMap.data.total`等，组件会根据接口返回数据的层级关系按映射配置自动解析获取到对应的数据。
:::

#### 4.2.1.1 配置完整的propsMap属性映射规则来映射接口返回的数据

```html
<template>
  <ll-table :http-request="fetchData" :props-map="propsMap"></ll-table>
</template>

<script>
export default {
  methods: {
    async fetchData(params) {
      // 模拟接口请求
      const response = await new Promise(resolve => {
        setTimeout(() => {
          resolve({
            pageSize: 10,
            pageNo: 1,
            totalCount: 100,
            dataList: [
              { name: '张三', age: 20 },
              { name: '李四', age: 25 }
            ]
          });
        }, 500);
      });
      return response;
    }
  },
  data() {
    return {
      propsMap: {
        total: 'totalCount',
        data: 'dataList',
        pageSize: 'pageSize', // 可以不配置，默认为pageSize
        currentPage: 'pageNo'
      }
    };
  }
};
</script>
```
#### 4.2.1.2 只配置propsMap的total和data属性映射数据，自己处理分页信息

组件支持配置`pageSize`和`currentPage`属性，它们都支持配置sync 修饰符来同步组件内部的分页信息，将内部分页信息暴露给父组件，自行处理分页映射后传递给接口。

eg:

```html
<template>
  <ll-table 
    :http-request="fetchData"
    :props-map="propsMap"
    :page-size.sync="query.pageSize"
    :current-page.sync="query.pageNo"
  ></ll-table>
</template>

<script>
export default {
  data() {
    return {
      query: {
        pageSize: 10, // 组件分页大小
        pageNo: 1 // 组件当前页码，默认是currentPage，这里处理成pageNo传递给接口
      }
    }
  },
  methods: {
    // 将自己处理的分页参数传递给接口
    async fetchData({ ...params, ...query }) {
      // 模拟接口请求
      const response = await new Promise(resolve => {
        setTimeout(() => {
          resolve({
            totalCount: 100,
            dataList: [
              { name: '张三', age: 20 },
              { name: '李四', age: 25 }
            ]
          });
        }, 500);
      });
      return response;
    }
  },
  data() {
    return {
      propsMap: {
        total: 'totalCount',
        data: 'dataList'
      }
    };
  }
};
</script>
```

## 5 组件布局

### 5.1 表格模块构成

组件主要由`工具栏(tool)`、`表格(table)`、`分页器(pagination)`和`附加内容(extra)`模块构成。

同一个模块可多次展示，比如上下都展示分析器，则配置为`tool, pagination, table, pagination`。

### 5.2 工具栏

可用于放置搜索框、操作按钮等元素。可以通过作用域插槽(`tool`)自定义工具栏内容，插槽参数见下方的插槽说明文档。

在组件的`layout`属性配置里面必须包含`tool`，否则不显示工具栏，默认显示。

```html
<template>
  <ll-table :data="tableData">
    <template slot="tool" slot-scope="{selection, selectionData, allSelection, allSelectionData, params}">
      <el-input v-model="searchKeyword" placeholder="请输入关键词搜索"></el-input>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </template>
  </ll-table>
</template>
```
### 5.3 表格

数据展示区域，由`数据展示区`、`工作列区`构成。

#### 5.3.1 数据展示区

数据展示区用于显示表格的主体数据，支持多种数据格式和展示方式。可以通过 `columns` 属性或 `template` 定义列来展示数据。

#### 5.3.2 工作列区

工作列区用于显示表格的操作列，如编辑、删除等。可以通过 `action-column` 属性或 `template` 定义操作列。

#### 5.3.2.1 动作列actionColumn

动作列用于放置对表格行进行操作的按钮，如编辑、删除等。通过 `action-column` 属性来定义，支持以下属性：

- `label`：操作列名称，默认为 `操作`。
- `width`：列宽度，默认为 `100px`。
- `buttons`：操作列按钮，默认为 `[]`。
- `render`：自定义操作列内容，默认为 `null`。

actionColumn的类型定义如下：

```ts
type ActionColumn = {
  label?: string; // 操作列名称，默认为 '操作'
  width?: string | number; // 列宽度，默认为 '100px'
  buttons?: ActionColumnButton[]; // 操作列按钮，默认为   []  
  render?: (h: createElement, scope: { row: Object, $index: number, ...rest}) => VNode; // 自定义操作列内容，默认为 null;
}
type ActionColumnButton = {
  label: string;
  icon?: string;
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text'; // el-button 的类型,primary | success | warning | danger | info | text
  props?: object; // el-button 的属性
  handler: (row: any, index: number) => void;
  order?: number; // 按钮排序，值越大，按钮越靠后
}
```

```html
<template>
  <ll-table :data="tableData" :columns="columns" :action-column="actionColumn"></ll-table>
</template>

<script>
export default {
  data() {
    return {
      tableData: [
        { name: '张三', age: 20 },
        { name: '李四', age: 25 }
      ],
      columns: [
        { prop: 'name', label: '姓名' },
        { prop: 'age', label: '年龄' },        
      ],
      actionColumn: {
        label: '操作',
        width: 120,
        // 操作按钮
        buttons: [
          {
            order: 1,
            icon: 'el-icon-edit',
            type: 'info',
            label: '',
            // 控制el-button的属性
            props: {
              // 上面的icon和type属性可不设置，在这里设置
              circle: true,
              type: 'info',
              icon: 'el-icon-edit',
              size: 'mini'
            },
            handler: ({ row }) => {
              this.$emit('edit', row);
            }
          }
        ],
        // 渲染函数，精确控制操作按钮
        render: (h, scope) => {
          const { row, $index } = scope;
          return h('div', [
            h('el-button', {
              props: {
                type: 'text',
                size: 'small'
              },
              on: {
                click: () => this.handleEdit(row)
              }
            }, '编辑'),
            h('el-button', {
              props: {
                type: 'text',
                size: 'small'
              },
              on: {
                click: () => this.handleDelete(row)
              }
            }, '删除')
          ]);
        }
      }
    };
  },
  methods: {
    handleEdit(row) {
      console.log('编辑', row);
    },
    handleDelete(row) {
      console.log('删除', row);
    }
  }
};
</script>
```
#### 5.3.2.2 筛选排序列

通过 `column-filterable` 属性来开启筛选排序列功能，用于对表格列进行筛选和排序。

##### 5.3.2.2.1 筛选

开启列过滤后，在表头右上角会出现一个齿轮图标，点击后可以进行筛选。

列筛选功能有多个属性可以配置，部分属性如下，详细属性介绍参见下方的组件属性说明：

- `columnFilterable`：是否开启列过滤功能，默认为 `false`。
- `columnFilterWidth`：列过滤宽度，默认为 `440px`。
- `columnFilterSelected`：列过滤选中的字段，由`column`的`prop`属性组成,默认为 `undefined`。
- `columnFilterAlwaysSelected`: 总是选中的列的字段，无法取消选中，由`column`的`prop`属性组成,默认为 `[]`。
- `columnFilterRowNum`：列过滤器每行显示的表格列字段数量，默认为 `4`。
- `columnFilterButtonLayout`：列过滤按钮布局，默认为 `cancel, all, reset`。
- `columnFilterCancelLabel`：取消按钮文本，默认为 `取消`。
- `columnFilterAllLabel`：全选按钮文本，默认为 `全选`。
- `columnFilterResetLabel`：重置按钮文本，默认为 `重置`。


eg:

```html
<template>
  <ll-table :data="tableData" :columns="columns" :column-filterable="true"></ll-table>
</template>

<script>
export default {
  data() {
    return {
      tableData: [
        { name: '张三', age: 20 },
        { name: '李四', age: 25 } 
      ],
      columns: [
        { prop: 'name', label: '姓名', columnFilterable: true }, // 开启筛选
        { prop: 'age', label: '年龄' } 
      ]
    } 
  },
  methods: {}
}
</script>
```

##### 5.3.2.2.2 拖动排序

通过`drag-sortable`属性开启列拖动排序功能，默认关闭。

列拖到排序有两种方式：

- 1.通过拖动表头(`thead`)对列进行排序
- 2.通过拖动列过滤器里面的item(`formItem`)对列进行排序

排序方式通过`dragSortMode`属性配置，默认为`thead`，即拖动表头排序，`formItem`即拖动列过滤器里面的item排序。

```html
<template>
  <ll-table :data="tableData" :columns="columns" :drag-sortable="true" :drag-sort-mode="formItem"></ll-table>
</template>

<script>
export default {
  data() {
    return {
      tableData: [
        { name: '张三', age: 20 },
        { name: '李四', age: 25 } 
      ],
      columns: [
        { prop: 'name', label: '姓名', columnFilterable: true }, // 开启筛选
        { prop: 'age', label: '年龄' }
      ]
    } 
  } 
}
</script>
```

#### 5.3.3 表格高度自适应

#### 5.3.4 禁用表格横向滚动条

通过`disable-h-scroll`属性禁用表格横向滚动条，默认关闭。

### 5.4 附加内容

附加内容区域，用于放置额外的信息，如统计信息、提示信息等。可以通过 `extra` 插槽自定义附加内容。

```html
<template>
  <ll-table :data="tableData">
    <template slot="extra">
      <div>总金额 {{ total }} </div>
    </template>
  </ll-table>
</template>
```

### 5.5 分页栏

分页栏用于显示表格的分页信息，通过在`layout`属性配置里面声明包含`pagination`来开启分页栏，通过作用域插槽 `tool` 来实现分页栏。

#### 5.5.1 分页栏固定到页面底部

可以通过 `pagination-fixed-on-buttom` 属性设置为`true`将分页栏固定到页面底部，默认为`false`。

## 6 高阶用法

### 6.1 表格排序

表格排序是指对表格数据按照某一列进行排序，支持静态排序和后端排序。

#### 6.1.1 静态排序

静态排序是指在前端对表格数据进行排序。

参照`el-table`的排序功能，通过`sortable`属性来开启排序功能，默认关闭。

#### 6.1.2 后端排序

后端排序是指在后端对表格数据进行排序。

参照`el-table`的排序功能，通过`sortable`属性设置为`custom`来开启自定义排序功能，监听`sort-change`事件，调用后端接口，获取排序后的数据。

eg:

```html
<template>
  <ll-table :columns="columns" :http-request="fetchData" @sort-change="handerSort"></ll-table>
</template>

<script>
export default {
  data() {
    return {
      query: { page: 1, pageSize: 10, name: '' },
      columns: [
        { prop: 'name', label: '姓名', sortable: 'custom' },
        { prop: 'age', label: '年龄', sortable: 'custom' }
      ]
    } 
  },
  methods: {
    // 处理排序
    handerSort({ prop, order }) {
      console.log('prop:', prop, 'order:', order);
      // 调用后端接口，获取排序后的数据
      // ...
    },
    // 处理分页
    fetchData(params) {
      return api.query({ ...this.query, ...params}).then(res => {
        return res.data;
      })
    }
  }
}
</script>
```

#### 6.1.3 表格行拖动排序

拖动表格行进行排序，通过`row-draggable`属性控制是否开启行拖动排序功能，默认关闭。

行拖到排序相关属性：
- `rowDraggable`：是否开启行拖动排序功能，类型为`Boolean`，默认为 `false`。
- `dragGroup`：拖拽分组，类型为`String`，默认值为 `llTable`。
- `ghostClass`：定义放置元素的类名称，类型为`String`，默认为 `ll-table__drag-row--ghostClass`。
- `chosenClass`：定义正在被拖动的元素类名称，类型为`String`，默认为 `ll-table__drag-row--chosen`。
- `dragOptions`：拖动组件配置，类型为`Object`，支持`sortablejs`的所有配置，如果配置了组件的dragGroup，ghostClass属性，那么他们的值会覆盖通过dragOptions配置的同名属性值，默认为 `{}`。
- `handleRowSortError`：自行处理排序时抛出的错误信息，给出操作提示，类型为`Function`。

eg:
```html
<template>
  <ll-table :columns="columns" :data="tableData" :row-draggable="true"></ll-table>
</template>
<script>
```

### 6.2 表格过滤

参见`el-table`的过滤功能。配置表格列的`filters`和`filter-method`等属性来控制过滤功能。

### 6.3 表格行选中

#### 6.3.1 当前页选中

选中数据只基于当前表格展示的页数据，翻页后选中数据会丢失。

当前页选中数据可通过组件的`selection`和`selection-data`属性使用sync修饰符来同步选中数据。`selection`由选中行的`row-key`属性值组成，`selection-data`为选中行数据。

若高清除选中的数据可调用表格组件暴露的`clearAllSelection`方法，该方法无参数，无返回值。

eg:

```html
<template>
  <ll-table :columns="columns" :data="tableData" :row-key="'id'" :selection.sync="selection" :selection-data.sync="selectionData"></ll-table>
</template>
<script>
export default {
  data() {
    return {
      selection: ['1'], // 选中行的row-key组成的数组
      selectionData: [{ id: 1, name: '张三', age: 20 }], // 选中行的数据 
      tableData: [
        { id: 1, name: '张三', age: 20 },
        { id: 2, name: '李四', age: 25 } 
      ]
      // 忽略其它属性
    } 
  } 
}
</script>
```

#### 6.3.2 分页选中

分页选中数据基于所有表格数据，翻页后选中数据不会丢失。通过`pagination-selectable`属性开控制是否开启分页选中功能，默认关闭（false）。

注意：数据使用完毕后不需要选中数据时需要手动清空选中数据，否则会造成选中了上次的数据的情况，清除选中数据可调用表格组件暴露的`clearAllSelection`方法，该方法无参数，无返回值。

所有选中数据也可通过组件的`selection`和`selection-data`属性使用sync修饰符来同步选中数据。`selection`由选中行的`row-key`属性值组成，`selection-data`为选中行数据。

eg:

```html
<template>
  <ll-table :columns="columns" :data="tableData" :row-key="'id'" :pagination-selectable="true" :selection.sync="selection" :selection-data.sync="selectionData"></ll-table>
</template>
<script>
export default {
  data() {
    return {
      selection: ['1'], // 选中行的row-key组成的数组
      selectionData: [{ id: 1, name: '张三', age: 20 }], // 选中行的数据 
      tableData: [
        { id: 1, name: '张三', age: 20 },
        { id: 2, name: '李四', age: 25 } 
      ]
      // 忽略其它属性
    } 
  } 
}
</script>
```

#### 6.3.3 深度选中

当表格数据存在父子结构时，选中或取消选中父节点时想同步选中或取消选中子节点，可通过`deep-select`属性控制是否开启深度选中功能，默认关闭（false）。

eg:

```html
<template>
  <ll-table :columns="columns" :data="tableData" :row-key="'id'" :deep-select="true" :selection.sync="selection" :selection-data.sync="selectionData"></ll-table>
</template>
<!-- 省略其它代码 -->
```
### 6.4 表格列排序

参见：[5.3.2.2.2 拖动排序](#53222-拖动排序)

### 6.5 多级表头

el-table默认支持多级表头，表格组件将模板语法转换成了json模板定义语法，通过`children`属性配置子列信息。

eg:

```html
<template>
  <ll-table :columns="columns" :data="tableData"></ll-table>
</template>
<script>
export default {
  data() {
    return {
      tableData: [
        { id: 1, name: '张三', age: 20, address: { city: '北京', district: '朝阳区' } },
        { id: 2, name: '李四', age: 25, address: { city: '上海', district: '黄浦区' } } 
      ],
      columns: [
        { prop: 'id', label: 'ID' },
        { prop: 'name', label: '姓名' },
        { prop: 'age', label: '年龄' },  
        // 多级表头配置
        { prop: 'location', label: '籍贯', children: [
            { prop: 'city', label: '城市' },
            { prop: 'district', label: '区县' }
          ]
        },
      ]
    } 
  } 
}
<script>
```

### 6.6 动态增减表格列

在表格列初始定义完成后，可以通过 `columns` 属性动态增删列。表格会自动根据列配置进行渲染。刷新表格。

eg:

```html
<template>
  <ll-table :columns="columns" :data="tableData"></ll-table>
</template>
<script>
export default {
  data() {
    return {
      tableData: [
        { id: 1, name: '张三', age: 20, address: { city: '北京', district: '朝阳区' } },
        { id: 2, name: '李四', age: 25, address: { city: '上海', district: '黄浦区' } } 
      ]，
      columns: [
        { prop: 'id', label: 'ID' },
        { prop: 'name', label: '姓名' },
        { prop: 'age', label: '年龄' }, 
      ]
    } 
  }，
  mounted() {
    // 动态添加列
    this.columns.push({ prop: 'address', label: '籍贯', children: [
        { prop: 'city', label: '城市' },
        { prop: 'district', label: '区县' }
      ]
    }); 
  }
}
</script>
```

### 6.7 表格行展开

在可展开行的表格,包括显示设置了`type='expand'`的列和行数据包含`children`的列(包含子行数据时父行必然是可展开的)，可配置哪些列默认展开。通过`expand-rows`属性设置默认展开的行，数据由row-key组成。

eg:
```html
<template>
  <ll-table :columns="columns" :data="tableData" :expand-rows="['1']"></ll-table
  ></ll-table>
</template>
<script>
export default {
 
  data() {
    return {
      tableData: [
        { id: 1, name: '张三', age: 20, children: [{ id: 11, name: '张三2', age: 20 }] },
        { id: 2, name: '李四', age: 25 } 
      ]，
      columns: [
        { prop: 'id', label: 'ID' }
        { prop: 'name', label: '姓名' }，
        { prop: 'age', label: '年龄' }，
      ]
    }
  }
}
</script>
```

### 6.8 可编辑表格

表格单元格支持编辑，可通过 `editable` 属性控制是否开启编辑功能，默认关闭。

编辑功能支持通过`click-edit`来控制编辑模式：

- 1.属性值为`false` 时，默认所有单元格都处于可编辑状态。
- 2.属性值为`true` 时，点击的单元格可编辑。

可通过`auto-save`属性控制编辑框失去焦点时是否自动发送`cell-change`事件以便监听保存，实现数据保存功能，默认值为`true`。

可通过`enter-save`属性控制编辑框按下回车时是否自动发送`cell-change`事件以便监听保存，实现数据保存功能，默认值为`false`。

触发保存操作的按钮名称可通过`save-label`属性来自定义，默认值为`保存`。

触发取消操作的按钮名称可通过`cancel-label`属性来自定义，默认值为`取消`。

当表格单元格处于编辑状态时，手动触发变更事件时，用户未保存单元格数据时的会触发提醒用户保存数据，提示信息可通过`save-message`属性来定义，默认值为`编辑内容未保存`。

eg:

```html
<template>
  <ll-table :columns="columns" :data="tableData" :editable="true" :click-edit="true" :auto-save="true" :enter-save="false" :save-label="`保存`" :cancel-label="`取消`" :save-message="`编辑内容未保存`"></ll-table>
</template>
<script>
  // 省略其它代码
```

## 7 组件属性详解

### 7.1 静态表格和动态表格公用的属性

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `layout` | `String` | `'tool, table, pagination'` | 表格布局排列方式，用于设置模块是否展示及展示顺序。支持配置'tool, table, extra, pagination'（分别表示工具栏、表格、附件内容、分页器）；同一个模块可多次展示（如`tool, pagination, table, pagination`） |
| `data` | `Array<Object>` | `[]` | 表格数据 |
| `columns` | `Array<Column>` | `[]` | 表格列配置 |
| `rowKey` | `String / Function` | `'id'` | 行数据的唯一标识（字符串为字段名，函数需返回唯一值） |
| `emptyPlaceholder` | `String / Function` | `''` | 单元格内容为空时的占位符（函数需返回占位符字符串） |
| `editable` | `Boolean` | `false` | 单元格是否可编辑 |
| `clickEdit` | `Boolean` | `true` | 是否点击单元格才展示编辑框（`false`时所有单元格默认可编辑） |
| `autoSave` | `Boolean` | `true` | 编辑框失去焦点时是否自动触发`cell-change`事件（用于保存） |
| `enterSave` | `Boolean` | `false` | 是否开启回车提交（触发`cell-change`事件） |
| `saveLabel` | `String` | `'保存'` | 保存按钮文本 |
| `cancelLabel` | `String` | `'取消'` | 取消按钮文本 |
| `saveMessage` | `String` | `'编辑内容未保存'` | 手动触发变更时，用户未保存数据的提示信息 |
| `dragSortable` | `Boolean` | `false` | 是否允许列拖动排序 |
| `dragSortMode` | `String` | `'thead'` | 拖动排序模式（`thead`：拖动表头排序；`formItem`：在列过滤器中拖动item排序） |
| `selection` | `Array` | `[]` | 默认选中的行（由`row-key`组成，`type='selection'`列生效） |
| `selectionData` | `Array` | `[]` | 默认选中的行完整数据（`type='selection'`列生效） |
| `expandRows` | `Array` | `[]` | 默认需要展开的行（由`row-key`组成） |
| `pageable` | `Boolean` | `true` | 是否启用分页功能 |
| `paginationSelectable` | `Boolean` | `false` | 是否支持分页选中（切换分页时保留选中状态） |
| `deepSelect` | `Boolean` | `false` | 点击选中行时是否深度选中（选中节点的子节点） |
| `paginationFixedOnButtom` | `Boolean` | `false` | 是否将分页栏固定到页面底部（需开启`autoHeight`） |
| `currentPage` | `Number` | `1` | 当前页码 |
| `pageSize` | `Number` | `10` | 每页数据条数（实际默认值为`10`，由全局配置或`paginationProps.pageSize`决定） |
| `paginationProps` | `Object` | `{}` | 分页器配置（与`el-pagination`属性一致） |
| `hideOnSinglePage` | `Boolean` | `undefined` | 只有一页时是否隐藏分页器（优先级高于`paginationProps.hideOnSinglePage`） |
| `customTableClass` | `String` | `undefined` | 自定义表格类名 |
| `autoHeight` | `Boolean` | `true` | 是否响应窗口大小调整表格内容区高度 |
| `minHeight` | `Number` | `100` | 表格内容区最小高度（单位：px） |
| `fixHeight` | `Number` | `100` | 表格内容区高度的修正系数（用于调整实际高度） |
| `tcdLayout` | `Boolean` | `false` | 是否启用上中下布局（中间内容区自适应，上下固定） |

#### 7.1.1 列过滤相关属性

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `columnFilterable` | `Boolean` | `false` | 是否启用列过滤功能 |
| `columnFilterSelected` | `Array` | `-` | 选中的列（由表格列的 `prop` 属性组成的数组），控制哪些列默认显示 |
| `columnFilterAlwaysSelected` | `Array` | `[]` | 默认始终选中的列（不可取消选中，由 `prop` 属性组成） |
| `columnFilterClass` | `String` | `'ll-table__filterColumn'` | 过滤表单的自定义 CSS 类名 |
| `columnFilterWidth` | `String / Number` | `440` | 过滤表单的宽度（支持像素值或百分比） |
| `columnFilterRowNum` | `Number` | `4` | 过滤表单每行显示的 CheckBox 数量（需满足 `24 % columnFilterRowNum === 0`） |
| `columnFilterButtonLayout` | `String` | `'cancel, all, reset'` | 过滤表单操作按钮的排列顺序（可选值：`cancel`（取消）、`all`（全选）、`reset`（重置），用逗号分隔） |
| `columnFilterCancelLabel` | `String` | `'取消'` | 过滤表单「取消」按钮的文本 |
| `columnFilterResetLabel` | `String` | `'重置'` | 过滤表单「重置」按钮的文本 |
| `columnFilterAllLabel` | `String` | `'全选'` | 过滤表单「全选」按钮的文本 |
| `maxColumnNum` | `Number` | `-` | 不包含操作列的最大展示列数（默认显示所有可过滤列） |
| `minColumnNum` | `Number` | `1` | 最小展示列数（需大于 0，否则控制台报错） |

#### 7.1.2 行拖动相关属性

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `rowDraggable` | `Boolean` | `false` | 是否启用表格行拖动排序功能 |
| `dragGroup` | `String` | `'llTable'` | 拖拽分组标识（用于跨表格拖动场景，相同分组的表格支持相互拖动） |
| `ghostClass` | `String` | `'ll-table__drag-row--ghostClass'` | 拖动时放置元素的 CSS 类名（控制占位行的样式） |
| `chosenClass` | `String` | `'ll-table__drag-row--chosen'` | 正在被拖动元素的 CSS 类名（控制当前拖动行的样式） |
| `dragOptions` | `Object` | `{}` | 拖动组件配置（支持 `sortablejs` 所有配置，若配置了 `dragGroup`、`ghostClass` 等属性，会覆盖组件默认值） |
| `handleRowSortError` | `Function` | `-` | 自定义处理行排序错误的回调函数（参数：错误类型 `String`、错误信息 `String`） |

### 7.2 动态表格特有的属性

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `total` | `Number` | `-` | 表格数据总量（通常动态表格不直接设置，用于初始化时的数据量配置） |
| `loading` | `Boolean` | `false` | 表格是否处于加载状态（控制加载动画显示） |
| `autoInit` | `Boolean` | `true` | 是否自动调用数据获取方法初始化表格（`true` 时组件挂载后自动请求数据） |
| `httpRequest` | `Function(query: Object, extraParams: Object): Promise / Object` | `-` | 数据查询配置：<br>- 函数：返回 `Promise` 对象，需解析为 `{data, total, pageSize, currentPage}` 格式；<br>- 对象：HTTP 请求配置对象（需实现 `get、post`方法） |
| `params` | `Object` | `{}` | 查询参数（会与分页参数合并后传递给 `httpRequest`） |
| `propsMap` | `Object` | `{data: 'data', total: 'total', pageSize: pageSize', currentPage: 'currentPage'}` | 接口数据映射配置（必填 `data` 和 `total` 字段，支持级联映射如 `data.list`）：<br>- `data`：接口返回数据集合（默认 `data`）；<br>- `total`：接口返回数据总条数字段名（默认 `total`）；<br>- `pageSize`：每页数据条数字段名（默认 `pageSize`）；<br>- `currentPage`：当前页字段名（默认 `currentPage`） |
| `fetch` | `Function` | `-` | HTTP 请求实例（用于发起请求，当 `httpRequest` 属性未配置时需配置此属性，否则报错，因为没有发起接口请求的实现） |

### 7.3 列属性扩展

表格列配置对象支持`el-table-column`的所有属性，同时支持以下扩展属性：

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `order` | `Number` | `-` | 定义列顺序，按值大小正序排序，默认值为列索引 |
| `render` | `Function(h, scope): VNodes` | `-` | 自定义列内容渲染函数，h 为 Vue 的 h 函数，scope 为列数据对象，包含`row`、`rowIndex`、`column`、`columnIndex`、`$index` 等属性 |
| `header` | `Function(h, { column, $index }): VNodes` | `-` | 自定义表头的渲染函数 |
| `editable` | `Boolean` | `false` | 是否可编辑，优先级高于组件配置的`editable`属性值 |

## 8 组件暴露的事件

组件对外暴露了一些时间，可以监听事件实现自定义功能。

### 8.1 数据变更事件

| 事件名 | 参数 | 说明 |
| --- | --- | --- |
| `cell-change` | `newVal, prop, row, $index` | 可编辑表格单元格数据变更后触发，`newVal`:  新值,`prop`: 列prop属性,`row`: 行数据,`$index`: 行索引 |
| `data-edit` | `curTableData: Array` | 可编辑表格数据修改后触发，``curTableData`: 当前表格数据 |
| `data-change` | `{ data: Array, total: Number, pageSize: Number, currentPage: Number, params: Object }` | 动态表格通过接口获取表格绑定数据成功时触发 |

### 8.2 分页变更事件

| 事件名 | 参数 | 说明 |
| --- | --- | --- |
| `size-change` | `pageSize: Number` | 分页大小改变时触发 |
| `current-page-change` | `currentPage: Number` | 页码变化时触发 |
| `pagination-change` | `{ pageSize: Number, currentPage: Number }` | 分页信息改变（包括分页大小、页码的变更）时触发 |
| `prev-click` | `currentPage: Number` | 点击上一页按钮改变当前页后触发 |
| `next-click` | `currentPage: Number` | 点击下一页按钮改变当前页后触发 |

### 8.3 列过滤变更事件

| 事件名 | 参数 | 说明 |
| --- | --- | --- |
| `column-filter` | `checkedColumns: Array` | 选中的列变更时实时触发，`checkedColumns`：选中列prop数组 |
| `column-filter-confirm` | `checkedColumns: Array` | 发送筛选完成事件，关闭过滤弹窗时触发（发生了筛选操作），`checkedColumns`：选中列prop数组 |
| `column-reset` | `checkedColumns: Array` | 列过滤重置为初始状态时触发，`checkedColumns`：重置后的列prop数组 |
| `hide-columns` | `hiddenColumnsProps: Array, hiddenColumns: Array` | 开启禁止展示横向滚动条时，表格内容出现横线滚动条触发列隐藏时会发送该事件， `hiddenColumnsProps`:被隐藏的列prop属性组成的集合，`hiddenColumns`:被隐藏的列对象组成的集合|

### 8.4 拖动表头对列排序完成时对外暴露的事件

| 事件名 | 参数 | 说明 |
| --- | --- | --- |
| `column-sort` | `allColumns: Array<Object>, sortedColumns: Array<String>` | 表头拖动排序完成时触发,`allColumns`:所有列信息配置信息集合,`sortedColumns`:排序后的列信息,由列`label`信息组成 |

### 8.5 拖动行排序完成时对外暴露的事件

| 事件名 | 参数 | 说明 |
| --- | --- | --- |
| `row-sort` | `tableData: Array, options: Object<{ direction: Enums('down','up'), behavior: Enums(0, 1, -1), from: Row, to: Row, fromIndex: Number, toIndex: Number, dragData: Row}>` | 行拖动排序完成时触发, `tableData`:排序完成后的表格数据，`options.direction`:排序方向,down表示向下拖动，`options.behavior`:排序行为，0表示同级节点间拖到，1表示子节点拖动到上级节点，节点提升，-1表示节点拖动为其它节点的子节点，节点降级，`options.from`:被拖拽的行数据，`options.to`:拖拽到的行数据，`options.fromIndex`:被拖拽的行索引，`options.toIndex`:拖拽到的行索引，`options.dragData`:拖拽的数据`|
| `row-sort-error` | `errorMessage: String` | 行拖动排序失败时触发（如父子节点拖拽到子节点内会报错：拖拽失败，父子点不能拖拽到自己的子节点内） |

## 9 组件暴露的方法

| 方法名 | 参数 | 说明 |
| --- | --- | --- |
| `doRequest` | `extraParams: Object, ...rest` | 手动发起数据请求。参数`extraParams`为额外查询参数，参数`rest`为附加请求参数） |
| `reRender` | `keepStatus: Boolean` | 重新渲染表格,参数`keepStatus`为是否保留表格状态，默认值为`true` |
| `reload` | `-` | 保留当前查询参数，重新加载表格数据（用于数据变更后刷新） |
| `resetTable` | `-` | 重置表格状态（清除搜索条件并刷新数据，需配合自定义工具栏清空条件） |
| `clearAllSelection` | `-` | 清除所有选中行（包括分页选中的行） |
| `clearAllColumnFilter` | `-` | 清除列过滤条件，恢复所有列默认显示状态 |
| `toggleRowsExpansion` | `rowKeys: Array` | 根据`row-key`集合展开或收起行，参数`rowKeys`为需要展开行的key集合 |
| `getTableRef` | `-` | 获取组件使用的`el-table`实例 |
| `getPaginationRef` | `-` | 获取组件使用的`el-pagination`实例 |

## 10 插槽

| 插槽名 | 作用 |
| --- | --- |
| `default`  | 默认插槽，用于自定义表格内容 |
| `extra` | 表格的`layout`属性配置里面需要包含`extra`该插槽才可用，用于添加额外的内容，添加位置根据`layout`属性配置的顺序而定。 |
| `empty` | 用于自定义表格无数据时显示的占位内容 |
| `append` | 用于在表格内容区底部添加内容 |
### 10.1 具名插槽-slot

| 插槽名 | 参数 | 作用 |
| --- | --- | --- |
|`tool`| `{selection: Array, selectionData: Array, allSelection: Array, allSelectionData: Array, params: Object}` | 用于自定义工具栏的内容，表格的`layout`属性配置里面需要包含`tool`该插槽才可用。参数`selection`为当前页选中的行数据的`row-key`集合，参数`selectionData`为当前页选中的行数据集合，参数`allSelection`为全部选中行数据的`row-key`集合（开启分页选中时，若未开启分页选中则值和selection一样），参数`allSelectionData`为全部选中行数据的集合，参数`params`为表格的查询参数对象。 |
|`pagination`| `{selection: Array, selectionData: Array, allSelection: Array, allSelectionData: Array, params: Object}` | 用于自定义分页器的内容，表格的`layout`属性配置里面需要包含`pagination`该插槽才可用。参数定义和`tool`插槽一致。 |
