<template>
  <div id="app">
    <div class="nav">
      <span><router-link :to="{ path: '/form-demo' }">基础示例</router-link></span>
      <span><router-link :to="{ path: '/custom-operate-button-demo' }">自定义表单操作按钮</router-link></span>
      <span><router-link :to="{ path: '/dynamic-form-demo' }">动态增减表单项示例</router-link></span>
    </div>
    <div>
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      loading: false,      
    };
  }
};
</script>

<style lang="scss">
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }
  .nav {
    text-align: center;
    span {
      padding: 10px;
    }
  }
</style>
