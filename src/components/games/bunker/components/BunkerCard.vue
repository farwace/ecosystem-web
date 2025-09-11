<template>
  <div class="card">
    <img :src="cardSrc" :alt="card.name">
  </div>
</template>
<script lang="ts" setup>
import type {Card} from "@/components/games/bunker/schemas/schemas/Card.ts";
import {computed} from "vue";

const props = defineProps<{
  card: Card;
  isMale: boolean;
  maxHeight?: number;
}>();

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
})

</script>
<style lang="scss" scoped>
.card{
  max-height: v-bind(cMaxHeight);
  width: fit-content;

  img{
    object-fit: contain;
    max-height: 200px;
    height: v-bind(cMaxHeight);
    max-width: 100px;
  }
}
</style>