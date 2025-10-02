<template>
  <div class="card">
    <template v-if="card.type == 'age' && card.value && calculatedTextSize">
      <div class="card-text" :style="{bottom: textBottomStyle, fontSize: textFontSize}">
        {{ card.value }} {{ PluralForm(card.value, 'год', 'года', 'лет')  }}
      </div>
    </template>
    <img
        ref="imageRef"
        :src="imageSrc"
        :alt="card.name"
        @load="onImageLoad"
        @error="onImageError"
    >
  </div>
</template>
<script lang="ts" setup>
import type {Card} from "@/components/games/bunker/schemas/schemas/Card.ts";
import {computed, nextTick, onBeforeUnmount, ref, watch} from "vue";
import {PluralForm} from "@/classes/utils/PluralForm.ts";

const props = defineProps<{
  card: Card;
  isMale: boolean;
  maxHeight?: number;
  fullWidth?: boolean;
  maxWidth?:string;
}>();

const calculatedTextSize = ref<boolean>(false);
const textFontSize = ref<string>();
const textBottomStyle = ref<string>();
const imageRef = ref<HTMLImageElement | null>(null);
const emits = defineEmits(['picture-load']);

const cardSrc = computed(() => {
  if(props.isMale && props.card.maleImageUrl) {
    return props.card.maleImageUrl;
  }
  if(props.card.femaleImageUrl){
    return props.card.femaleImageUrl;
  }
  return props.card.maleImageUrl || '';
});

const maxRetryAttempts = 3;
const baseRetryDelay = 1000;
const retryCount = ref(0);
const imageSrc = ref('');
let retryTimeoutId: ReturnType<typeof setTimeout> | null = null;

const buildSrc = (base: string, attempt: number) => {
  if(!base){
    return base;
  }
  if(attempt === 0){
    return base;
  }
  const separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}_retry=${attempt}&_ts=${Date.now()}`;
};

const clearRetryTimeout = () => {
  if(retryTimeoutId !== null){
    clearTimeout(retryTimeoutId);
    retryTimeoutId = null;
  }
};

watch(cardSrc, (newSrc) => {
  clearRetryTimeout();
  retryCount.value = 0;
  imageSrc.value = buildSrc(newSrc, 0);
}, {immediate: true});

const cMaxHeight = computed(() => {
  if(props.maxHeight){
    return `${props.maxHeight}px`;
  }
  return 'unset';
});

const cMaxWidth = computed(() => {
  if(props.maxWidth){
    return `${props.maxWidth}`;
  }
  return props.fullWidth ? 'unset' : '100px';
});


const onImageLoad = () => {
  clearRetryTimeout();
  retryCount.value = 0;
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
    emits('picture-load');
  });
}

const onImageError = () => {
  if(!cardSrc.value){
    return;
  }
  if(retryCount.value >= maxRetryAttempts){
    clearRetryTimeout();
    return;
  }

  const nextAttempt = retryCount.value + 1;
  const delay = baseRetryDelay * Math.pow(2, retryCount.value);

  clearRetryTimeout();
  retryTimeoutId = setTimeout(() => {
    retryCount.value = nextAttempt;
    imageSrc.value = buildSrc(cardSrc.value, nextAttempt);
  }, delay);
};

onBeforeUnmount(() => {
  clearRetryTimeout();
});

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
    max-width: v-bind(cMaxWidth);
  }
}
</style>
