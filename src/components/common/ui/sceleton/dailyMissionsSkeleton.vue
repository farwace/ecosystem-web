<template>
  <div class="daily-missions-skeleton">
    <div v-for="i in 10" :key="i" class="item" />
  </div>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
.daily-missions-skeleton {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 5px;

  .item {
    position: relative;
    overflow: hidden;
    background-color: #FFFAEA;
    height: 62px;
    border-radius: 12px;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.6),
              transparent
      );
      animation: shimmer 1.5s infinite;
    }
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(200%);
  }
  100% {
    transform: translateX(200%);
  }
}
</style>