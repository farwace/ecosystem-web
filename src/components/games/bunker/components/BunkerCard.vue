<template>
  <div class="card">
    <template v-if="card.type == 'age' && card.customData.value && calculatedTextSize">
      <div class="card-text" :style="{bottom: textBottomStyle, fontSize: textFontSize}">
        {{ card.customData.value }} {{ PluralForm(card.customData.value, 'год', 'года', 'лет')  }}
      </div>
    </template>
    <img
        ref="imageRef"
        :src="cardSrc"
        :alt="card.name"
        @load="onImageLoad"
    >
  </div>
</template>
<script lang="ts" setup>
import type {Card} from "@/components/games/bunker/schemas/schemas/Card.ts";
import {computed, nextTick, onMounted, ref} from "vue";
import {PluralForm} from "@/classes/utils/PluralForm.ts";

const props = defineProps<{
  card: Card;
  isMale: boolean;
  maxHeight?: number;
}>();

const calculatedTextSize = ref<boolean>(false);
const textFontSize = ref<string>();
const textBottomStyle = ref<string>();
const imageRef = ref<HTMLImageElement | null>(null);

const cardSrc = computed(() => {
  if(props.isMale && props.card.maleImageUrl) {
    return props.card.maleImageUrl;
  }
  if(props.card.femaleImageUrl){
    return props.card.femaleImageUrl;
  }
  return props.card.maleImageUrl || '';
});

const cMaxHeight = computed(() => {
  if(props.maxHeight){
    return `${props.maxHeight}px`;
  }
  return 'unset';
});

const onImageLoad = () => {
  nextTick(() => {
    if(imageRef.value){
      const rect = imageRef.value.getBoundingClientRect();
      const originalHeight = rect.height;
      const width = rect.width;
      const height = Math.floor(width * 100 / 80.5);
      textFontSize.value = Math.floor(height / 100 * 9.7) + 'px';
      textBottomStyle.value = Math.abs(originalHeight - height)/2 -1 + Math.floor(height / 100 * 6.8) + 'px';
      calculatedTextSize.value = true;
    }
  });
}

</script>
<style lang="scss" scoped>
.card{
  max-height: v-bind(cMaxHeight);
  width: fit-content;
  position: relative;

  .card-text{
    position: absolute;
    width: 100%;
    text-align: center;
    left: 0;
    color: #DDCDA3;
    font-weight: bold;
  }

  img{
    object-fit: contain;
    max-height: 200px;
    height: v-bind(cMaxHeight);
    max-width: 100px;
  }
}
</style>