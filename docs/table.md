
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
    - [6.2.1 静态表格过滤](#621-静态表格过滤)
    - [6.2.2 动态表格过滤](#622-动态表格过滤)
  - [6.3 表格行选中](#63-表格行选中)
    - [6.3.1 当前页选中](#631-当前页选中)
    - [6.3.2 分页选中](#632-分页选中)
    - [6.3.3 深度选中](#633-深度选中)
  - [6.4 表格列排序](#64-表格列排序)
  - [6.5 多级表格](#65-多级表格)
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
  - [8.3 过滤信息变更事件](#83-过滤信息变更事件)
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

#### 6.1.2 后端排序

#### 6.1.3 表格行拖动排序

### 6.2 表格过滤

#### 6.2.1 静态表格过滤

#### 6.2.2 动态表格过滤

### 6.3 表格行选中

#### 6.3.1 当前页选中

#### 6.3.2 分页选中

#### 6.3.3 深度选中

### 6.4 表格列排序

### 6.5 多级表格

### 6.6 动态增减表格列

### 6.7 表格行展开

### 6.8 可编辑表格

## 7 组件属性详解

### 7.1 静态表格和动态表格公用的属性

#### 7.1.1 列过滤相关属性

#### 7.1.2 行拖动相关属性

### 7.2 动态表格特有的属性

### 7.3 列属性扩展

## 8 组件暴露的事件

### 8.1 数据变更事件

### 8.2 分页变更事件

### 8.3 过滤信息变更事件

### 8.4 拖动表头对列排序完成时对外暴露的事件

### 8.5 拖动行排序完成时对外暴露的事件

## 9 组件暴露的方法

## 10 插槽

### 10.1 具名插槽-slot

### 10.2 作用域插槽-scopedSlot