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
    border-color: #FBE4CD;
    background-color: #FFF6EC;
    padding: 12px 16px;
    color: #BC7D4D;

    &:hover{
      box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.05);
    }
  }
</style>