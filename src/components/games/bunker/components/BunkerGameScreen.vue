<template>
  <div class="screen">
    <div class="screen__inner">
      <div v-if="text">
        {{ text }}
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {computed} from "vue";

const props = defineProps<{
  maxHeight: number,
  text?: string,
}>();

const maxHeight = computed(() => {
  if(!props.maxHeight) {
    return 'unset';
  }
  return `${props.maxHeight}px`;
});
</script>
<style lang="scss" scoped>

.screen{
  color: #F5D8B6;
  font-size: 20px;
  font-weight: bold;
  margin-left: auto;
  margin-right: auto;
  width: 338px;
  height: 202px;
  max-height: v-bind(maxHeight);
  display: flex;
  flex-direction: column;
  text-align: center;
  align-items: center;
  justify-content: center;

  &__inner{
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    background-image: url('/assets/img/games/bunker/bunker-border-filled.png');
    height: 100%;
    max-width: calc(100% - 80px);
    padding: 15px 16px;
    aspect-ratio: 17/10;
    text-wrap: wrap;
    word-wrap: break-word;
  }
}
</style>