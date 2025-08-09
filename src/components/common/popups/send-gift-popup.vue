<template>
  <transition name="opacity-absolute">
    <div class="gift-list" v-if="isLoading">
      <gifts-skeleton :height-item="'129px'" />
    </div>
  </transition>
  <div v-if="!isLoading">
    <swiper class="gifts-swiper" :modules="modules" :pagination="{clickable: true}">
      <swiper-slide v-for="group in groupedGifts" :key="'group-' + group[0].id">
        <div class="gift-list">
          <div
              class="gift"
              v-for="gift in group"
              :key="'gift-list-' + gift.id"
              :class="{
                'selected': selectedGift === gift.code
              }"
              @click="selectedGift = gift.code"
          >
            <div class="gift__picture">
              <img :src="'/assets/img/gifts/' + gift.code + '.png'" :alt="gift.name">
            </div>
            <div class="gift__title">
              <div class="gift__title__outer">
                <div class="absolute-marquee-text" v-marquee="'scroll'">
                  {{ gift.name }}
                </div>
              </div>
            </div>
            <div class="gift__price">
              <UiIcon class="coin" name="coin" />
              {{ gift.price }}
            </div>
          </div>
        </div>
      </swiper-slide>
    </swiper>
  </div>

  <div class="gift-send">
    <div
        @click="openDonatPopup"
        class="balance"
    >
      <UiIcon class="coin" name="coin"/>
      {{ balance }}
      <span>+</span>
    </div>
    <span :disabled="!selectedGift">Подарить</span>
  </div>
</template>
<script lang="ts" setup>

import {computed, inject, onMounted, ref} from "vue";
import {storeToRefs} from "pinia";
import {ecosystemStore} from "@/stores/Ecosystem/ecosystemStore";
import GiftsSkeleton from "@/components/common/popups/Gift/gifts-skeleton.vue";
import {vMarquee} from "@/classes/directives/marquee.ts";
import type {IGiftsProvider} from "@/modules/ApiModule/Interfaces/IGiftsProvider.ts";
import {BalanceProviderSymbol, GiftsProviderSymbol} from "@/modules/ApiModule/symbols.ts";
import UiIcon from "@/components/common/icons/UiIcon.vue";
import {Swiper, SwiperSlide} from "swiper/vue";
import {Pagination} from "swiper/modules";

import 'swiper/css';
import 'swiper/css/pagination';
import type {IBalanceProvider} from "@/modules/ApiModule/Interfaces/IBalanceProvider.ts";

const props = defineProps<{
  userId: number | string,
  darkBg?: boolean,
  title?: string,
}>();
defineEmits(['close']);

const isLoading =  ref(true);
const { giftList, balance } = storeToRefs(ecosystemStore())
const selectedGift = ref<string>();
const giftsProvider:IGiftsProvider | undefined = inject(GiftsProviderSymbol);
const modules = [Pagination];

const balanceProvider: IBalanceProvider | undefined = inject(BalanceProviderSymbol);

function* chunks<T>(arr: T[], n: number): Generator<T[], void> {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n);
  }
}

const groupedGifts = computed(() => {
  if(!giftList.value) return [];
  return [...chunks(giftList.value, 8)];
})


onMounted(async () => {
  isLoading.value = true;
  await giftsProvider?.getGiftList();
  isLoading.value = false;
})

const openDonatPopup = () => {
  balanceProvider?.openDonutPopup();
}

</script>

<style lang="scss" scoped>
.gifts-swiper{
  --swiper-pagination-bullet-inactive-color: #936044;
  --swiper-pagination-bullet-inactive-opacity: 50%;
  --swiper-pagination-color: #936044;
}

.gift-list{
  display: grid;
  grid-template-columns: (1fr 1fr 1fr 1fr);
  gap: 2px;
  padding-bottom: 25px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  min-height: 286px;
  align-items: start;
}

.gift{
  cursor: pointer;
  border-radius: 12px;
  padding-bottom: 7px;
  background-color: rgba(217, 217, 217, 0);
  transition: background-color .2s ease-out;
  &.selected{
    background-color: rgba(217, 217, 217, 0.4);
  }
  &:hover{
    background-color: rgba(217, 217, 217, 0.3);
  }
  &__picture{
    img{
      width: 100%;
      height: 75px;
      object-fit: contain;
    }
  }
  &__title{
    width: 100%;
    padding: 0 8px;
    white-space: nowrap;
    font-size: 12px;
    &__outer{
      position: relative;
      overflow: hidden;
      height: 20px;
    }
    .absolute-marquee-text{
      text-align: center;
      display: inline-block;
      position: absolute;
      left: 0;
      width: 100%;
      height: 100%;
      &.scroll{
        -webkit-animation: scroll 12s infinite linear;
        -moz-animation: scroll 12s infinite linear;
        animation: scroll 12s infinite linear;
      }
    }
  }
  &__price{
    margin-top: 5px;
    margin-left: -10px;
    display: flex;
    align-items: center;
    justify-content: center;
    img{
      width: 15px;
      height: 15px;
      margin-right: 2px;
    }
  }

}

@-webkit-keyframes scroll {
  0% {transform: translateX(0%);}
  40% {transform: translateX(var(--marquee-width));}
  52% {transform: translateX(var(--marquee-width));}
  90% {transform: translateX(0%);}
  100% {transform: translateX(0%);}
}

@-moz-keyframes scroll {
  0% {transform: translateX(0%);}
  40% {transform: translateX(var(--marquee-width));}
  52% {transform: translateX(var(--marquee-width));}
  90% {transform: translateX(0%);}
  100% {transform: translateX(0%);}
}

@keyframes scroll {
  0% {transform: translateX(0%);}
  40% {transform: translateX(var(--marquee-width));}
  52% {transform: translateX(var(--marquee-width));}
  90% {transform: translateX(0%);}
  100% {transform: translateX(0%);}
}

.gift-send{
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;

  .balance{
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 2px;
    font-weight: bold;
    img{
      width: 15px;
      height: 15px;
    }
    span{
      color: #E48F58;
    }
  }
}

.coin{
  width: 12px;
  height: 12px;
  margin-right: 3px;
}
</style>