<template>
  <el-input :value="value" :size="$attrs.size" @input="handleInput"></el-input>
</template>

<script>
  export default {
    name: 'CustomInput',
    props: {
      value: [String, Number]
    },
    methods: {
      handleInput(val) {
        this.$emit('input', val);
      }
    }
  };
</script>
