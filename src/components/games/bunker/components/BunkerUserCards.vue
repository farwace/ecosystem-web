<template>
  <div class="cards">
    <div
        class             =   "cards-list"
        ref               =   "rCardsListRef"
        v-click-outside   =   "fOnClickOutside"
    >
      <div
          v-for                           =   "(card, index) in cAvailableCards"
          :key                            =   "`card-${card.id}`"
          class                           =   "card-wrapper"
          :class                          =   "{ active: rHoveredIndex === index }"
          :style                          =     "{
                                                  left: `${index * rDynamicStep}px`,
                                                  zIndex: rHoveredIndex === index ? 10 : index
                                                }"
          @mouseenter                     =   "rHoveredIndex = index"
          @mouseleave                     =   "rHoveredIndex = null"
          @touchstart.prevent.stop        =   "fOnTouchStartCardWrapper(index, $event)"
          @touchend.prevent.stop          =   "fOnTouchEndCardWrapper(index, $event)"
          @click.prevent                  =   "fOnClickCardWrapper(index, $event)"
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
import {Console} from "@/classes/utils/Console.ts";

const vClickOutside               =   ClickOutside;

const props                       =   defineProps<{
                                                  maxHeight       ?: number,
                                                  cards           ?: ArraySchema<Card>,
                                                  revealedCards   ?: ArraySchema<Card>,
                                                  isSpeaker       ?: boolean,
                                                  isMale          ?: boolean,
                                                }>();


const rSkipCardId                 =   ref<number | string>();

const rStartTouchIndex            =   ref<number | null>(null);
const rHoveredIndex               =   ref<number | null>(null);
const rCardsListRef               =   ref<HTMLElement | null>(null);
const rDynamicStep                =   ref(0);
let   lInitialIndex               =   0;
let   lStartX                     =   0;

const cMaxHeight                  =   computed(() => props?.maxHeight ? `${props.maxHeight}px` : 'unset');

const cAvailableCards             =   computed(() =>
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

const fOnClickOutside             =   () => {
                                        rHoveredIndex.value = null;
                                      }

const fHandleTouchStart           =   (event: TouchEvent) =>  {
                                        lStartX = event.touches[0].clientX;
                                        lInitialIndex = rHoveredIndex.value ?? 0;
                                      };

const fHandleTouchMove            =   (event: TouchEvent) => {
                                        const currentX = event.touches[0].clientX;
                                        const deltaX = currentX - lStartX;

                                        const stepSize = rDynamicStep.value;
                                        if (!stepSize || (cAvailableCards.value?.length || 0) === 0) return;

                                        const floatIndex = lInitialIndex + deltaX / stepSize;
                                        const clampedIndex = Math.max(0, Math.min((cAvailableCards.value?.length || 0) - 1, floatIndex));
                                        rHoveredIndex.value = Math.round(clampedIndex);
                                      };

const fDropCard                   = (index: number) => {
                                      const cardId = cAvailableCards?.value?.[index]?.id;
                                      if(cardId){
                                        rHoveredIndex.value = null;
                                        rSkipCardId.value = cardId;
                                        setTimeout(() => {
                                          rSkipCardId.value = undefined;
                                        }, 3000)
                                      }
                                    }

const fDismissCard                =   (index: number, event: MouseEvent | TouchEvent) => {
                                        const cardId = cAvailableCards?.value?.[index]?.id;
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
                                          rSkipCardId.value = cardId;
                                          rHoveredIndex.value = null;

                                          // сбросим inline стили
                                          cardEl.style.transform = '';
                                          cardEl.style.opacity = '';
                                          cardEl.style.transition = '';
                                        }, 500);


                                        setTimeout(() => {
                                          if (rSkipCardId.value === cardId) {
                                            rSkipCardId.value = undefined;
                                          }
                                        }, 2000);
                                      };

const fOnTouchEndCardWrapper      =   (index: number, $event: TouchEvent) => {
                                        Console.log('>>> TOUCH END >>>', index, rHoveredIndex.value, rStartTouchIndex.value);
                                        if(index == rHoveredIndex.value && rStartTouchIndex.value === null){
                                          //fDismissCard
                                          fDismissCard(index, $event);
                                        }
                                      }

const fOnTouchStartCardWrapper    =   (index: number, $event: TouchEvent) => {
                                        Console.log('>>> TOUCH START >>>', index, rHoveredIndex.value);
                                        rStartTouchIndex.value = (rHoveredIndex.value != index) ? index : null;
                                        rHoveredIndex.value = index;
                                      }
const fOnClickCardWrapper         =   (index: number, $event: MouseEvent | TouchEvent) => {
                                        fDismissCard(index, $event);
                                      }

const fUpdateCardsDistance        =   () => {
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



watch(cAvailableCards, ()     =>  { fUpdateCardsDistance(); });


onMounted(() => {
                fUpdateCardsDistance();
                window.addEventListener('resize', fUpdateCardsDistance);

                if (rCardsListRef.value) {
                  rCardsListRef.value.addEventListener('touchmove', fHandleTouchMove, { passive: true });
                  rCardsListRef.value.addEventListener('touchstart', fHandleTouchStart, { passive: true });
                }
              });

onUnmounted(() => {
                    window.removeEventListener('resize', fUpdateCardsDistance);
                    if (rCardsListRef.value) {
                      rCardsListRef.value.removeEventListener('touchstart', fHandleTouchStart);
                      rCardsListRef.value.removeEventListener('touchmove', fHandleTouchMove);
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