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
          :class                          =   "{
                                                active: (rLockedHoveredIndex !== null ? rLockedHoveredIndex === index : rHoveredIndex === index) && !rIsDragging,
                                                dragging: rIsDragging && rDraggedCardIndex === index
                                              }"
          :style                          =     "{
                                                  left: `${rPreviewPadding + index * (rDynamicStep || 0)}px`,
                                                  zIndex: (rLockedHoveredIndex !== null ? rLockedHoveredIndex === index : rHoveredIndex === index) ? 10 : index
                                                }"
          @mouseenter                     =   "!rIsDragging && rLockedHoveredIndex === null && (rHoveredIndex = index)"
          @mouseleave                     =   "!rIsDragging && rLockedHoveredIndex === null && (rHoveredIndex = null)"
          @touchstart.prevent.stop        =   "fOnTouchStartCardWrapper(index, $event)"
          @touchend.prevent.stop          =   "fOnTouchEndCardWrapper(index, $event)"
          @click.prevent                  =   "fOnClickCardWrapper(index, $event)"
      >
        <BunkerCard
            :card         =   "card"
            :max-height   =   "maxHeight"
            :is-male      =   "!!isMale"
            @picture-load =   "fUpdateCardsDistance"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>

import type { ArraySchema } from "@colyseus/schema";
import type { Card } from "@/components/games/bunker/schemas/schemas/Card.ts";
import BunkerCard from "@/components/games/bunker/components/BunkerCard.vue";
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from "vue";
import { ClickOutside } from "@/classes/directives/clickOutside.ts";
import {Console} from "@/classes/utils/Console.ts";

const vClickOutside               =   ClickOutside;

const props                       =   defineProps<{
                                                  maxHeight       ?: number,
                                                  cards           ?: ArraySchema<Card>,
                                                  revealedCards   ?: ArraySchema<Card>,
                                                  isSpeaker       ?: boolean,
                                                  isMale          ?: boolean,
                                                  isEliminated    ?: boolean,
                                                }>();

const emits                       =  defineEmits(['sendCard']);

const rSkipCardId                 =   ref<number | string>();

const rStartTouchIndex            =   ref<number | null>(null);
const rHoveredIndex               =   ref<number | null>(null);
const rCardsListRef               =   ref<HTMLElement | null>(null);
const rDynamicStep                =   ref(0);
const rCardWidth                  =   ref(100);
const rPreviewPadding             =   ref(0);

// Новые переменные для вертикального свайпа
const rIsDragging                 =   ref(false);
const rDragStartY                 =   ref(0);
const rDragStartX                 =   ref(0);
const rCurrentDragY               =   ref(0);
const rDraggedCardIndex           =   ref<number | null>(null);
const rDragDirection              =   ref<'none' | 'horizontal' | 'vertical'>('none');
const rLockedHoveredIndex         =   ref<number | null>(null);


let   lInitialIndex               =   0;
let   lStartX                     =   0;

const CARD_ACTIVE_SCALE           =   1.4; // Keep in sync with .card-wrapper.active scale
const ACTIVE_SCALE_TO_BASE_DELTA  =   CARD_ACTIVE_SCALE - 1;
const MIN_CARD_STEP               =   30;
const MAX_CARD_STEP               =   100;

// Константы для настройки поведения свайпа
const DISMISS_THRESHOLD           =   120; // Расстояние, после которого карточка отправляется
const DIRECTION_LOCK_THRESHOLD    =   15;  // Порог для блокировки направления

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
                                        // Создаем новую сессию для каждого touchstart
                                        lStartX = event.touches[0].clientX;
                                        lInitialIndex = rHoveredIndex.value ?? 0;
                                      };


const fHandleTouchMove            =   (event: TouchEvent) => {
                                        // Блокируем горизонтальную навигацию если карточка заблокирована
                                        if (rLockedHoveredIndex.value !== null) return;

                                        const currentX = event.touches[0].clientX;
                                        const deltaX = currentX - lStartX;

                                        const stepSize = rDynamicStep.value;
                                        if (!stepSize || (cAvailableCards.value?.length || 0) === 0) return;

                                        const floatIndex = lInitialIndex + deltaX / stepSize;
                                        const clampedIndex = Math.max(0, Math.min((cAvailableCards.value?.length || 0) - 1, floatIndex));
                                        Console.log('>>> CHANGE rHOVERED INDEX fHandleTouchMove >>>')
                                        rHoveredIndex.value = Math.round(clampedIndex);
                                      };

const fForceDropCard              = (cardId?: string | number) => {
                                      if(cardId){
                                        rSkipCardId.value = cardId;
                                        setTimeout(() => {
                                          rSkipCardId.value = undefined;
                                        }, 2000)
                                      }
                                    }

const fDismissCard                =   (index: number, event: MouseEvent | TouchEvent) => {
                                        if(!props.isSpeaker){return;}
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
                                          emits('sendCard', cardId);
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

// Функция сброса состояния перетаскивания
const fResetDragState             = () => {
                                      rIsDragging.value = false;
                                      rDraggedCardIndex.value = null;
                                      rCurrentDragY.value = 0;
                                      rDragDirection.value = 'none';
                                      rLockedHoveredIndex.value = null;
                                    };

const fReturnCardToNormalState    = (cardWrapper: HTMLElement) => {
                                      cardWrapper.style.transition = 'transform 0.3s ease';
                                      cardWrapper.style.transform = 'scale(1) translateY(0px)';

                                      setTimeout(() => {
                                        cardWrapper.style.transition = '';
                                        cardWrapper.style.transform = '';
                                      }, 300);
                                    };


// Новые функции для работы с вертикальным свайпом
const fOnTouchStartCardWrapper    =   (index: number, $event: TouchEvent) => {
                                        Console.log('>>> TOUCH START >>>', index, rHoveredIndex.value, rDynamicStep.value);

                                        const touch = $event.touches[0];
                                        const currentSession = Date.now();

                                        // Сохраняем начальные координаты
                                        rDragStartX.value = touch.clientX;
                                        rDragStartY.value = touch.clientY;
                                        rCurrentDragY.value = 0;

                                        rStartTouchIndex.value = (rHoveredIndex.value != index) ? index : null;
                                        Console.log('>>> CHANGE rHOVERED INDEX fOnTouchStartCardWrapper >>>')
                                        rHoveredIndex.value = index;

                                        // Сбрасываем состояние перетаскивания
                                        fResetDragState();
                                      }


const fHandleCardTouchMove        =   (event: TouchEvent) => {
                                        if (rHoveredIndex.value === null) return;

                                        const touch = event.touches[0];
                                        const deltaX = touch.clientX - rDragStartX.value;
                                        const deltaY = touch.clientY - rDragStartY.value;

                                        const absDeltaX = Math.abs(deltaX);
                                        const absDeltaY = Math.abs(deltaY);

                                        // Определяем направление движения только если оно еще не зафиксировано
                                        if (rDragDirection.value === 'none' && (absDeltaX > DIRECTION_LOCK_THRESHOLD || absDeltaY > DIRECTION_LOCK_THRESHOLD)) {
                                          if (absDeltaY > absDeltaX && deltaY < 0) {
                                            // Вертикальное движение вверх
                                            rDragDirection.value = 'vertical';
                                            Console.log('>>> VERTICAL MOVE >>>');
                                            rIsDragging.value = true;
                                            rDraggedCardIndex.value = rHoveredIndex.value;
                                            rLockedHoveredIndex.value = rHoveredIndex.value;
                                            event.preventDefault();
                                          } else if (absDeltaX > absDeltaY) {
                                            // Горизонтальное движение
                                            rDragDirection.value = 'horizontal';
                                            Console.log('>>> HORIZONTAL MOVE >>>');
                                            // НЕ блокируем, просто продолжаем горизонтальное движение
                                            if (!rIsDragging.value) {
                                              fHandleTouchMove(event);
                                            }
                                            return;
                                          }
                                        }

                                        if (rDragDirection.value === 'vertical' && rIsDragging.value) {
                                          // Обрабатываем вертикальное перетаскивание
                                          rCurrentDragY.value = deltaY;

                                          const cardElement = event.target as HTMLElement;
                                          const cardWrapper = cardElement.closest('.card-wrapper') as HTMLElement;

                                          if (cardWrapper) {
                                            const dragDistance = Math.abs(deltaY);
                                            let scale: number;
                                            let translateY: number;

                                            if (deltaY < 0) {
                                              // Движение вверх
                                              const progress = Math.min(1, dragDistance / DISMISS_THRESHOLD);
                                              const maxDrop = CARD_ACTIVE_SCALE - 0.8;
                                              scale = Math.max(0.8, CARD_ACTIVE_SCALE - progress * maxDrop);
                                              translateY = deltaY - 20;
                                            } else {
                                              // Движение вниз (возврат)
                                              const returnProgress = Math.min(1, dragDistance / 50);
                                              scale = CARD_ACTIVE_SCALE - (ACTIVE_SCALE_TO_BASE_DELTA * returnProgress);
                                              translateY = -20 + (20 * returnProgress);
                                            }

                                            cardWrapper.style.transform = `scale(${scale}) translateY(${translateY}px)`;
                                            cardWrapper.style.transition = 'none';
                                          }
                                        } else if (rDragDirection.value === 'horizontal') {
                                          // Обрабатываем горизонтальное движение только если не в режиме вертикального перетаскивания
                                          if (!rIsDragging.value) {
                                            fHandleTouchMove(event);
                                          }
                                        }
                                      };


const fOnTouchEndCardWrapper      =   (index: number, $event: TouchEvent) => {
                                        Console.log('>>> TOUCH END >>>', index, rHoveredIndex.value, rStartTouchIndex.value, 'isDragging:', rIsDragging.value, 'direction:', rDragDirection.value);
                                        fClearAllDragStyles();
                                        if (rIsDragging.value && rDraggedCardIndex.value === index && rDragDirection.value === 'vertical') {
                                          // Завершаем вертикальный свайп
                                          const cardElement = $event.target as HTMLElement;
                                          const cardWrapper = cardElement.closest('.card-wrapper') as HTMLElement;

                                          if (cardWrapper) {
                                            const dragDistance = Math.abs(rCurrentDragY.value);
                                            const isUpwardDrag = rCurrentDragY.value < 0;

                                            if (isUpwardDrag && dragDistance >= DISMISS_THRESHOLD) {
                                              // Карточка перетащена достаточно далеко вверх - отправляем её
                                              fDismissCard(index, $event);
                                            } else {
                                              // Возвращаем карточку в нормальное состояние и убираем hover
                                              fReturnCardToNormalState(cardWrapper);
                                              rHoveredIndex.value = null;
                                            }
                                          }
                                        } else if (index === rHoveredIndex.value && rStartTouchIndex.value === null && !rIsDragging.value && rDragDirection.value !== 'horizontal') {
                                          // Обычный тап по карточке (только если не было горизонтального движения)
                                          rHoveredIndex.value = null;
                                          //fDismissCard(index, $event);
                                        }

                                        // Сбрасываем все состояния - ВАЖНО: каждая новая сессия начинает заново
                                        rStartTouchIndex.value = null;
                                        fResetDragState();
                                      }



const fOnClickCardWrapper         =   (index: number, $event: MouseEvent | TouchEvent) => {
                                      // Клик мышью (для десктопа)
                                      if (!rIsDragging.value) {
                                        fDismissCard(index, $event);
                                      }
                                    }

const fUpdateCardsDistance        =   () => {
                                        nextTick(() => {
                                          const listEl = rCardsListRef.value;
                                          const totalCards = cAvailableCards.value?.length || 0;

                                          if (!listEl || !totalCards) {
                                            rDynamicStep.value = 0;
                                            rPreviewPadding.value = 0;
                                            return;
                                          }

                                          const sampleCard = listEl.querySelector?.('.card-wrapper') as HTMLElement | null;

                                          if (sampleCard) {
                                            const rect = sampleCard.getBoundingClientRect();

                                            if (rect.width) {
                                              rCardWidth.value = rect.width;
                                              rPreviewPadding.value = Math.ceil((rect.width * (CARD_ACTIVE_SCALE - 1)) / 2);
                                            }
                                          }

                                          if (totalCards < 2) {
                                            rDynamicStep.value = 0;
                                            return;
                                          }

                                          const containerWidth = listEl.clientWidth || listEl.offsetWidth;
                                          const availableWidth = containerWidth - rCardWidth.value - (rPreviewPadding.value * 2);
                                          const safeAvailableWidth = Math.max(0, availableWidth);
                                          const idealStep = safeAvailableWidth / (totalCards - 1);

                                          if (idealStep < MIN_CARD_STEP) {
                                            rDynamicStep.value = idealStep;
                                            return;
                                          }

                                          rDynamicStep.value = Math.max(MIN_CARD_STEP, Math.min(idealStep, MAX_CARD_STEP));
                                        });
                                      };

const fClearAllDragStyles          =   () => {
                                        if(rCardsListRef.value){
                                          /* @ts-ignore */
                                          rCardsListRef.value?.querySelectorAll?.('.card-wrapper').forEach?.((cardWrapper: HTMLElement) => {
                                            if(cardWrapper?.style){
                                              cardWrapper.style.transition = '';
                                              cardWrapper.style.transform = '';
                                            }
                                          });
                                        }
                                      }

watch(cAvailableCards, ()     =>  { fUpdateCardsDistance(); });
watch(rHoveredIndex, (neoVal)  =>  {
  Console.log('>>> HOVERED INDEX >>>', neoVal);
  fClearAllDragStyles();
});
watch(() => props.isEliminated, (neoVal) => {
  if(neoVal){
    fForceDropCard(props.cards?.[0]?.id);
  }
})
defineExpose({
  fForceDropCard
});

onMounted(() => {
                fUpdateCardsDistance();
                window.addEventListener('resize', fUpdateCardsDistance);

                if (rCardsListRef.value) {
                  //rCardsListRef.value.addEventListener('touchmove', fHandleTouchMove, { passive: true });
                  rCardsListRef.value.addEventListener('touchstart', fHandleTouchStart, { passive: true });
                  // Добавляем новый обработчик для вертикального движения карточек
                  rCardsListRef.value.addEventListener('touchmove', fHandleCardTouchMove, { passive: false });
                }
              });

onUnmounted(() => {
                    window.removeEventListener('resize', fUpdateCardsDistance);
                    if (rCardsListRef.value) {
                      rCardsListRef.value.removeEventListener('touchstart', fHandleTouchStart);
                      //rCardsListRef.value.removeEventListener('touchmove', fHandleTouchMove);
                      rCardsListRef.value.removeEventListener('touchmove', fHandleCardTouchMove);
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
    transform: scale(1.4) translateY(-20px);
    z-index: 999;
  }

  &.dragging {
    z-index: 1000;

    // Во время перетаскивания убираем стили класса active
    &.active {
      transform: none;
    }
  }
}
</style>
