<template>
  <div class="snow" aria-hidden="true">
    <span v-for="flake in flakes" :key="flake.id" class="snow__flake" :style="flake.style"></span>
  </div>
</template>

<script setup lang="ts">
import {ref, watch} from "vue";

type FlakeStyle = Record<string, string>;

interface Flake {
  id: number;
  style: FlakeStyle;
}

const props = withDefaults(defineProps<{count?: number}>(), {
  count: 48,
});

const flakes = ref<Flake[]>([]);

const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

const buildFlakes = (count: number): Flake[] => {
  return Array.from({length: count}, (_, index) => {
    const size = randomBetween(4, 10);

    return {
      id: index,
      style: {
        left: `${randomBetween(0, 100)}%`,
        width: `${size}px`,
        height: `${size}px`,
        animationDelay: `${-randomBetween(0, 10)}s`,
        animationDuration: `${randomBetween(6, 14)}s`,
        opacity: `${randomBetween(0.3, 0.9)}`,
      },
    };
  });
};

watch(() => props.count, (count) => {
  flakes.value = buildFlakes(count);
}, {immediate: true});
</script>

<style scoped lang="scss">
.snow{
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 5;
  overflow: hidden;
}

.snow__flake{
  position: absolute;
  top: -10px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95) 0%, rgba(195, 219, 255, 0.8) 70%);
  border: 1px solid rgba(140, 178, 255, 0.7);
  box-shadow: 0 0 6px rgba(140, 178, 255, 0.6);
  filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.12));
  animation: snowfall linear infinite;
}

@keyframes snowfall{
  0%{
    transform: translate3d(0, -120%, 0);
  }
  100%{
    transform: translate3d(0, 120vh, 0);
  }
}
</style>
