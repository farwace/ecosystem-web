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
    transition: background-color .3s ease-out, box-shadow .3s ease-out;
    &:hover{
      background-color: #fff9f1;
      box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.05);
    }
  }

  [theme=dark]{
    .btn{
      border-color: #363738;
      background-color: #222222;
      color: #939393;

      &:hover{
        background-color: #2d2c2c;
        box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.2);
      }
    }
  }
</style>