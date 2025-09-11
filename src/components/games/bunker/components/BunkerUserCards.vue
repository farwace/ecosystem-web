<template>
  <div class="cards">
    <div class="cards-stack" ref="cardsStack">
      <div
          v-for="(card, index) in availableCards"
          :key="`card-${card.id}`"
          class="card-wrapper"
          :class="{ active: hoveredIndex === index }"
          :style="{
        left: `${index * dynamicStep}px`,
        zIndex: hoveredIndex === index ? 10 : index
      }"
          @mouseenter="hoveredIndex = index"
          @mouseleave="hoveredIndex = null"
          @touchstart="hoveredIndex = index"
      >
        <BunkerCard :card="card" :max-height="maxHeight" :is-male="!!isMale" />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>

import type {ArraySchema} from "@colyseus/schema";
import type {Card} from "@/components/games/bunker/schemas/schemas/Card.ts";
import {computed, onMounted, ref, watch} from "vue";
import BunkerCard from "@/components/games/bunker/components/BunkerCard.vue";

const hoveredIndex = ref<number | null>(null);
const cardsStack = ref<HTMLElement | null>(null);
const dynamicStep = ref(0);

const availableCards = computed(() => {
  if((props.cards?.length || 0)< 1){
    return [];
  }
  return props.cards?.filter(c => {
    let showCard = true;
    props.revealedCards?.forEach((card) => {
      if(c.id == card.id){
        showCard = false;
      }
    });
    return showCard;
  });
});

const updateStep = () => {
  if (!cardsStack.value || (availableCards.value?.length || 0) < 2) {
    dynamicStep.value = 0;
    return;
  }
  const containerWidth = cardsStack.value.offsetWidth;
  const totalCards = availableCards.value?.length || 0;
  const cardWidth = 100; // Примерная ширина карточки, можешь заменить на реальную
  const maxTotalWidth = cardWidth + (totalCards - 1) * 40; // если просто кучкой
  const idealStep = (containerWidth - cardWidth) / (totalCards - 1);

  // Минимальный отступ: 30, максимальный: 100 (на всякий случай)
  dynamicStep.value = Math.max(30, Math.min(idealStep, 100));
};

const props = defineProps<{
  maxHeight?: number,
  cards?: ArraySchema<Card>,
  revealedCards?: ArraySchema<Card>,
  isSpeaker?: boolean,
  isMale?: boolean,
}>();



const cMaxHeight = computed(() => {
  if(props.maxHeight){
    return `${props.maxHeight}px`;
  }
  return 'unset';
});

onMounted(() => {
  updateStep();
  window.addEventListener('resize', updateStep);
});

watch(availableCards, () => {
  updateStep();
});

</script>
<style lang="scss" scoped>
.cards{
  position: relative;
  width: 100%;
  margin-bottom: -10px;
}

.cards {
  position: relative;
  width: 100%;
  height: v-bind(cMaxHeight); // если хочешь использовать ограничение по высоте
  overflow: visible;
}

.cards-stack {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.card-wrapper {
  position: absolute;
  transition: transform 0.3s ease, z-index 0.3s ease, left .3s ease;
  cursor: pointer;
  transform: scale(1);

  &.active {
    transform: scale(1.5) translateY(-20px);
    z-index: 999;
  }
}
</style>