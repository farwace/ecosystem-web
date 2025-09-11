<template>
  <div class="cards">
    <div
        class="cards-stack"
        ref="cardsStack"
        v-click-outside="() => {hoveredIndex = null}"
    >
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
          @touchstart.stop.prevent="handleTouch(index, card.id, $event)"
          @click="handleClick(index, card.id, $event)"
      >
        <BunkerCard :card="card" :max-height="maxHeight" :is-male="!!isMale" />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>

import type {ArraySchema} from "@colyseus/schema";
import type {Card} from "@/components/games/bunker/schemas/schemas/Card.ts";
import {computed, onMounted, onUnmounted, ref, watch} from "vue";
import BunkerCard from "@/components/games/bunker/components/BunkerCard.vue";
import {ClickOutside} from "@/classes/directives/clickOutside.ts";

const vClickOutside = ClickOutside;

const props = defineProps<{
  maxHeight?: number,
  cards?: ArraySchema<Card>,
  revealedCards?: ArraySchema<Card>,
  isSpeaker?: boolean,
  isMale?: boolean,
}>();


const skipCardId = ref<number | string>();

const hoveredIndex = ref<number | null>(null);
const cardsStack = ref<HTMLElement | null>(null);
const dynamicStep = ref(0);
let initialIndex = 0;

const availableCards = computed(() => {
  if((props.cards?.length || 0)< 1){
    return [];
  }
  return props.cards?.filter(c => {
    let showCard = true;
    if(c.id == skipCardId.value){
      showCard = false;
    }
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




const cMaxHeight = computed(() => {
  if(props.maxHeight){
    return `${props.maxHeight}px`;
  }
  return 'unset';
});

let startX = 0;

const handleTouchStart = (event: TouchEvent) => {
  startX = event.touches[0].clientX;
  initialIndex = hoveredIndex.value ?? 0;
};

const handleTouchMove = (event: TouchEvent) => {
  const currentX = event.touches[0].clientX;
  const deltaX = currentX - startX;

  const stepSize = dynamicStep.value;
  if (!stepSize || (availableCards.value?.length || 0) === 0) return;

  const floatIndex = initialIndex + deltaX / stepSize;
  const clampedIndex = Math.max(0, Math.min((availableCards.value?.length || 0) - 1, floatIndex));
  hoveredIndex.value = Math.round(clampedIndex);
};

const handleTouch = (index: number, cardId: number | string, event: MouseEvent | TouchEvent): void => {
  if (hoveredIndex.value !== index) {
    hoveredIndex.value = index;
  }
  else{
    dismissCard(cardId, event);
  }
};

const handleClick = (index: number, cardId: number | string, event: MouseEvent | TouchEvent) => {
  if (hoveredIndex.value === index) {
    dismissCard(cardId, event);
  } else {
    hoveredIndex.value = index;
  }
};

const dismissCard = (cardId: number | string, event: MouseEvent | TouchEvent) => {
  const cardEl = (event.currentTarget as HTMLElement);
  if (!cardEl) return;

  const rect = cardEl.getBoundingClientRect();
  const screenCenterX = window.innerWidth / 2;
  const screenCenterY = window.innerHeight / 2;

  const cardCenterX = rect.left + rect.width / 2;
  const cardCenterY = rect.top + rect.height / 2;

  const deltaX = screenCenterX - cardCenterX;
  const deltaY = screenCenterY - cardCenterY;

  // Применяем кастомные стили прямо в элемент
  cardEl.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
  cardEl.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.5)`;
  cardEl.style.opacity = '0';

  setTimeout(() => {
    skipCardId.value = cardId;
    hoveredIndex.value = null;

    // сбросим inline стили
    cardEl.style.transform = '';
    cardEl.style.opacity = '';
    cardEl.style.transition = '';
  }, 500);

  // Возвращаем карточку через 3 секунды, если нужно
  setTimeout(() => {
    if (skipCardId.value === cardId) {
      skipCardId.value = undefined;
    }
  }, 3000);
};

watch(availableCards, () => {
  updateStep();
});

onMounted(() => {
  updateStep();
  window.addEventListener('resize', updateStep);

  if (cardsStack.value) {
    cardsStack.value.addEventListener('touchmove', handleTouchMove, { passive: true });
    cardsStack.value.addEventListener('touchstart', handleTouchStart, { passive: true });
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', updateStep);
  if (cardsStack.value) {
    cardsStack.value.removeEventListener('touchstart', handleTouchStart);
    cardsStack.value.removeEventListener('touchmove', handleTouchMove);
  }
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
  touch-action: pan-y;
}

.card-wrapper {
  position: absolute;
  transition: transform 0.3s ease, z-index 0.3s ease, left .3s ease;
  cursor: pointer;
  transform: scale(1);
  will-change: transform;
  &.active {
    transform: scale(1.5) translateY(-20px);
    z-index: 11;
  }
}
</style>