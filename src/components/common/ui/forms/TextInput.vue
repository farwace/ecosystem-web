<template>
  <input v-model="model" class="text-input" v-bind="$attrs">
</template>
<script lang="ts" setup>

const model = defineModel();
</script>
<style lang="scss" scoped>
.text-input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #e6cdb6;
  border-radius: 12px;
  font-size: 16px;
  font-family: inherit;
  transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
  background-color: #fff8f1;
  color: #5c4a3c;

  &::placeholder {
    color: #aa9988;
  }

  // Hover
  &:hover:not(:disabled) {
    border-color: #d8bca3;
  }

  // Focus
  &:focus:not(:disabled) {
    outline: none;
    border-color: #c49c7a;
    background-color: #fff5ea;
    box-shadow: 0 0 0 3px rgba(196, 156, 122, 0.2); // мягкое подсвечивание
  }

  // Disabled
  &:disabled {
    background-color: #f7ebdf;
    border-color: #e6d5c4;
    color: #b4a39a;
    cursor: not-allowed;

    &::placeholder {
      color: #c6b8aa;
    }
  }
}
</style>
