<template>
  <el-input :value="value" @input="handleInput" :size="$attrs.size"></el-input>
</template>

<script>
export default {
  name: 'CustomInput',
  props: {
    value: [String, Number]
  },
  methods: {
    handleInput(val) {
      this.$emit('input', val)
    }
  }
}
</script>
