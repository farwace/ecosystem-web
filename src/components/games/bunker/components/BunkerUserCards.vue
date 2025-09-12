<template>
  <div class="cards">
    <div
        class             =   "cards-list"
        ref               =   "rCardsListRef"
        v-click-outside   =   "fOnClickOutside"
    >
      <div
          v-for         =   "(card, index) in cAvailableCards"
          :key          =   "`card-${card.id}`"
          class         =   "card-wrapper"
          :class        =   "{ active: rHoveredIndex === index }"
          :style        =   "{
                              left: `${index * rDynamicStep}px`,
                              zIndex: rHoveredIndex === index ? 10 : index
                            }"
          @mouseenter   =   "rHoveredIndex = index"
          @mouseleave   =   "rHoveredIndex = null"
          @touchstart   =   "rHoveredIndex = index"
      >
        <BunkerCard
            :card         =   "card"
            :max-height   =   "maxHeight"
            :is-male      =   "!!isMale"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>

import type { ArraySchema } from "@colyseus/schema";
import type { Card } from "@/components/games/bunker/schemas/schemas/Card.ts";
import BunkerCard from "@/components/games/bunker/components/BunkerCard.vue";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { ClickOutside } from "@/classes/directives/clickOutside.ts";

const vClickOutside         =   ClickOutside;

const props                 =   defineProps<{
                                            maxHeight       ?: number,
                                            cards           ?: ArraySchema<Card>,
                                            revealedCards   ?: ArraySchema<Card>,
                                            isSpeaker       ?: boolean,
                                            isMale          ?: boolean,
                                          }>();


const rSkipCardId           =   ref<number | string>();

const rHoveredIndex         =   ref<number | null>(null);
const rCardsListRef        =   ref<HTMLElement | null>(null);
const rDynamicStep          =   ref(0);
let   lInitialIndex         =   0;
let   lStartX               =   0;

const cMaxHeight            =   computed(() => props?.maxHeight ? `${props.maxHeight}px` : 'unset');

const cAvailableCards       =   computed(() =>
                                  props.cards?.filter?.(c => {
                                    let showCard = true;
                                    if(c.id == rSkipCardId.value){
                                      showCard = false;
                                    }
                                    props.revealedCards?.forEach((card) => {
                                      if(c.id == card.id){ showCard = false; }
                                    });
                                    return showCard;
                                  }
                                ));

const fOnClickOutside       =   () => {
                                  rHoveredIndex.value = null;
                                }

const fUpdateCardsDistance  =   () => {
                                  if (!rCardsListRef.value || (cAvailableCards.value?.length || 0) < 2) {
                                    rDynamicStep.value = 0;
                                    return;
                                  }
                                  const containerWidth = rCardsListRef.value.offsetWidth;
                                  const totalCards = cAvailableCards.value?.length || 0;
                                  const cardWidth = 100; // Примерная ширина карточки
                                  const idealStep = (containerWidth - cardWidth) / (totalCards - 1);
                                  // Минимальный отступ: 30, максимальный: 100
                                  rDynamicStep.value = Math.max(30, Math.min(idealStep, 100));
                                };

const handleTouchStart      =   (event: TouchEvent) =>  {
                                  lStartX = event.touches[0].clientX;
                                  lInitialIndex = rHoveredIndex.value ?? 0;
                                };

const handleTouchMove       =   (event: TouchEvent) => {
                                  const currentX = event.touches[0].clientX;
                                  const deltaX = currentX - lStartX;

                                  const stepSize = rDynamicStep.value;
                                  if (!stepSize || (cAvailableCards.value?.length || 0) === 0) return;

                                  const floatIndex = lInitialIndex + deltaX / stepSize;
                                  const clampedIndex = Math.max(0, Math.min((cAvailableCards.value?.length || 0) - 1, floatIndex));
                                  rHoveredIndex.value = Math.round(clampedIndex);
                                };

watch(cAvailableCards, () => {
                                  fUpdateCardsDistance();
                                });

onMounted(() => {
                fUpdateCardsDistance();
                window.addEventListener('resize', fUpdateCardsDistance);

                if (rCardsListRef.value) {
                  rCardsListRef.value.addEventListener('touchmove', handleTouchMove, { passive: true });
                  rCardsListRef.value.addEventListener('touchstart', handleTouchStart, { passive: true });
                }
              });

onUnmounted(() => {
                    window.removeEventListener('resize', fUpdateCardsDistance);
                    if (rCardsListRef.value) {
                      rCardsListRef.value.removeEventListener('touchstart', handleTouchStart);
                      rCardsListRef.value.removeEventListener('touchmove', handleTouchMove);
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
  height: v-bind(cMaxHeight);
  overflow: visible;
}

.cards-list {
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
    z-index: 999;
  }
}
</style>