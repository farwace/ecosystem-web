<template>
  <input class="range" type="range" :min="min" :max="max" :step="step" v-model="modelValue"/>
</template>
<script lang="ts" setup>
import {computed} from "vue";

const props = defineProps<{
  min:number,
  max:number,
  step: number
}>();

const modelValue = defineModel<string>();

const linearGradient = computed(() => {
  if(parseInt(modelValue.value || '0') < 99){
    return "linear-gradient(to right, var(--filled-color) 0%, var(--filled-color) " + modelValue.value + "%, var(--empty-color) " + (+(modelValue.value || 0)+1) + "%, var(--empty-color) 100%)";
  }
  return 'var(--filled-color)';

})

</script>
<style lang="scss" scoped>

[theme=dark]{
  .range {
    --filled-color: #703E1A;
    --empty-color: #939393;
  }
  /* Input Track */

  /* Chrome, Safari, Edge (Chromium) */
  .range::-webkit-slider-runnable-track {
    background: #939393;
    background: v-bind(linearGradient);

  }

  /* Firefox */
  .range::-moz-range-track {
    background: #939393;
    background: v-bind(linearGradient);
  }

  /* Input Thumb */

  /* Chrome, Safari, Edge (Chromium) */
  .range::-webkit-slider-thumb {
    background: #703E1A;
    border: 2px solid #703E1A;
  }

  /* Firefox */
  .range::-moz-range-thumb {
    background: #703E1A;
    border: 2px solid #703E1A;
  }

}

.range {
  appearance: none;
  background: transparent;
  width: 100%;
  cursor: pointer;
  border-radius: 3px;

  --track-height: 6px;
  --thumb-height: 18px;
  --thumb-width: 18px;
  --filled-color: #EB8E4F;
  --empty-color: #bdbdbd;
}

/* Input Track */

/* Chrome, Safari, Edge (Chromium) */
.range::-webkit-slider-runnable-track {
  background: #EB8E4F;
  background: v-bind(linearGradient);
  height: var(--track-height);
  border-radius: 3px;
}

/* Firefox */
.range::-moz-range-track {
  background: #EB8E4F;
  background: v-bind(linearGradient);
  height: var(--track-height);
  border-radius: 3px;
}

/* Input Thumb */

/* Chrome, Safari, Edge (Chromium) */
.range::-webkit-slider-thumb {
  appearance: none;
  background: #EB8E4F;
  border-radius: 50%;
  width: var(--thumb-width);
  height: var(--thumb-height);
  margin-top: calc((var(--track-height) / 2) - (var(--thumb-height) / 2));
  border: 2px solid #BC7D4D;
}

/* Firefox */
.range::-moz-range-thumb {
  appearance: none;
  background: #EB8E4F;
  border-radius: 0;
  border-radius: 50%;
  border: 2px solid #BC7D4D;
}

/* Focus styles */

.range:focus {
  outline: none;
}

/* Chrome, Safari, Edge (Chromium) */
.range:focus::-webkit-slider-thumb  {
  outline: none;
}

/* Firefox */
.range:focus::-moz-range-thumb {
  outline: none;
}
</style>