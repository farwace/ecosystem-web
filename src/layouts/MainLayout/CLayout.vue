<template>
  <div class="c-layout">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped lang="scss">
.c-layout{
  position: fixed;
  width: 100%;
  padding-top: env(safe-area-inset-top,0);
  height: 100%;
  background-color: #FFF2E2;
  color: #BC7D4D;
}
</style>