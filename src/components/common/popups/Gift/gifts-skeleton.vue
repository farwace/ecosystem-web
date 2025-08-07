<template>
  <div class="gift-skeleton" :style="heightItem ? 'height: ' + heightItem : ''" v-for="i in 8" :key="'gift-skeleton-' + i">

  </div>
</template>
<script lang="ts" setup>
  withDefaults(defineProps<{
    heightItem?: string
  }>(), {
    heightItem: '100px'
  })
</script>
<style lang="scss" scoped>
.gift-skeleton{
  display: block;
  background-color: rgba(217, 217, 217, 0.3);
  width: 100%;
  flex-shrink: 0;
  border-radius: 12px;
  -webkit-animation: shine-loading-image 2s infinite ease-out;
  animation: shine-loading-image 2s infinite ease-out;
}



@-webkit-keyframes shine-loading-image {
  0% {
    background-color: rgba(217, 217, 217, 0.3);
  }
  45% {
    background-color: rgba(217, 217, 217, 0.7);
  }
  75% {
    background-color: rgba(217, 217, 217, 0.7);
  }
  100%{
    background-color: rgba(217, 217, 217, 0.3);
  }
}


@keyframes shine-loading-image {
  0% {
    background-color: rgba(217, 217, 217, 0.3);
  }
  33% {
    background-color: rgba(217, 217, 217, 0.5);
  }
  66% {
    background-color: rgba(217, 217, 217, 0.5);
  }
  100%{
    background-color: rgba(217, 217, 217, 0.3);
  }
}

</style>