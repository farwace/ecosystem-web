<template>
  <div class="coming-soon">
    Coming soon!
  </div>
</template>
<script lang="ts" setup>

</script>
<style lang="scss" scoped>
.coming-soon {
  position: absolute;
  right: -8px;
  bottom: -12px;
  z-index: 2;
  font-size: 10px;
  font-weight: 500;
  padding: 0 8px;
  border-radius: 100px;
  border: 1px solid;
}

[theme=dark]{
  .coming-soon{
    background-color: #151515;
    border-color: #939393;
    color: #939393;
  }
}
[theme=light]{
  .coming-soon{
    background-color: #FFF2E2;
    border-color: #BA7D50;
    color: #BA7D50;
  }
}

</style>