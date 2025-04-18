<template>
  <div id="app">
    <div class="nav">
      <span><router-link :to="{ path: '/form/simple-demo' }">简单表单示例</router-link></span>
      <span><router-link :to="{ path: '/form/demo' }">基础表单示例</router-link></span>
      <span><router-link :to="{ path: '/form/step' }">分步表单示例</router-link></span>
      <span><router-link :to="{ path: '/form/custom-operate-button' }">自定义表单操作按钮</router-link></span>
      <span><router-link :to="{ path: '/form/dynamic-form' }">动态增减表单项示例</router-link></span>
    </div>
    <div class="nav">
      <span><router-link :to="{ path: '/table/table-static' }">表格示例</router-link></span>
    </div>
    <div class="container">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      loading: false
    };
  }
};
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 20px;
}
.nav {
  text-align: center;
  margin-top: 20px;
  span {
    padding: 10px;
  }
}
.container {
  padding: 20px 50px;
}
</style>
