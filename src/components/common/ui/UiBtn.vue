<template>
<div class="btn" :class="[props.class]">
  <slot />
</div>
</template>
<script lang="ts" setup>
const props = defineProps<{class?: string}>();
</script>
<style lang="scss" scoped>
  .btn{
    border-radius: 100px;
    cursor: pointer;
    border-width: 2px;
    border-style: solid;
    border-color: var(--btn-secondary-border);
    background-color: var(--btn-secondary-bg);
    padding: 12px 16px;
    color: var(--btn-secondary-text);

    &:hover{
      box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.05);
    }
  }
</style>