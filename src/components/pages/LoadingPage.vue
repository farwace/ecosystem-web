<template>
  <div
      class="loading-page"
  >
    <div class="background-dots">
      <div
          v-for="(dot, index) in totalDots"
          :key="index"
          class="dot"
          :style="{
          top: `${Math.floor(index / columns) * spacing}px`,
          left: `${(index % columns) * spacing}px`
        }"
      />
    </div>

    <img class="rocket" src="/assets/img/rocket.svg" alt="rocket" />

    <div class="loading-text" v-html="sanitizeHtml(loadingText)"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import {sanitizeHtml} from '@/utils/sanitize-html';
//import Snowfall from "@/components/common/ui/Snowfall.vue";

const loadingText = ref('Загрузка&nbsp;&nbsp;&nbsp;')

let dotIndex = 0
const dotSequence = ['.&nbsp;&nbsp;', '..&nbsp;', '...', '..&nbsp;', '.&nbsp;&nbsp;', '&nbsp;&nbsp;&nbsp;']

let intervalId: number;

const columns = 40
const rows = 40
const spacing = 50 // px
const totalDots = columns * rows

onMounted(() => {
  intervalId = setInterval(() => {
    loadingText.value = 'Загрузка' + dotSequence[dotIndex]
    dotIndex = (dotIndex + 1) % dotSequence.length
  }, 300) as unknown as number;


})

onUnmounted(() => {
  clearInterval(intervalId)
})
</script>

<style lang="scss" scoped>
.loading-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #fde9d9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: sans-serif;
  font-size: 24px;
  animation: fade-in 0.4s ease-in forwards;
  opacity: 0;
}

.rocket {
  width: 100px;
  animation: rocket-float 4s ease-in-out infinite;
  position: relative;
  z-index: 2;
}

.loading-text {
  margin-top: 20px;
  font-weight: bold;
  position: relative;
  z-index: 2;
}


@keyframes rocket-float {
  0% { transform: translateY(0); }
  25% { transform: translateY(-10px); }
  50% { transform: translateY(-20px); }
  75% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
}
@keyframes fade-in {
  to {
    opacity: 1;
  }
}

.background-dots {
  position: absolute;
  top: -200px;
  left: 0;
  width: 200%;
  height: 200%;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;

  .dot {
    position: absolute;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    animation: snowfall 6s linear infinite;
  }
}

// Движение точек по диагонали (снегопад)
@keyframes snowfall {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(-100px, 200px);
  }
}
[theme="dark"] {
  .loading-page{
    background-color: #222222;
  }
  .background-dots{
    .dot{
      opacity: .08;
    }
  }
}
</style>
