<template>
  <div class="profile__gifts">
    <template v-if="(gifts?.length || 0) > 0">
      <div class="profile__gifts__wall" @click="openGiftListModal">
        <div class="profile__gifts__wall__swiper">
          <swiper
              :effect="'coverflow'"
              :slides-per-view="1"
              :loop="true"
              :coverflowEffect="{
                rotate: 20,
                stretch: 7,
                depth: 100,
                modifier: 10,
                slideShadows: false,

              }"
              :space-between="0"
              :modules="modules"
              :autoplay="{delay: 2500, disableOnInteraction: false,}"
              class="profile__gifts__swiper"
          >
            <swiper-slide v-for="gift in gifts" :key="`profile-gift-${gift.code}`">
              <img :src="'/assets/img/gifts/' + gift.code + '.png'" :alt="gift.name">
            </swiper-slide>
          </swiper>
        </div>
        <div>
          <span v-if="count">
            Всего: <b>{{ count }}</b>
          </span>
        </div>
      </div>

    </template>
    <template v-else>
      Здесь ничего нет 😭 <span class="send-gift" v-if="id" @click="giftsProvider?.openGiftsPopup(id, avatar)">подарите подарок!</span>
    </template>
  </div>
</template>
<script lang="ts" setup>

import type {TGift} from "@/stores/Ecosystem/Types/TGift.ts";
import type {IGiftsProvider} from "@/modules/ApiModule/Interfaces/IGiftsProvider.ts";
import {inject} from "vue";
import {GiftsProviderSymbol} from "@/modules/ApiModule/symbols.ts";
import {Swiper, SwiperSlide} from "swiper/vue";
import {Autoplay, EffectCoverflow} from "swiper/modules";

import 'swiper/css';
import 'swiper/css/pagination';

const giftsProvider: IGiftsProvider | undefined = inject(GiftsProviderSymbol);
const modules = [Autoplay, EffectCoverflow];

const openGiftListModal = () => {

}

const props = defineProps<{
  gifts?:TGift[] | null,
  count?:number | null,
  id?: number | string,
  avatar?: string
}>();


</script>
<style lang="scss" scoped>
.profile{
  &__gifts{

    :deep(.swiper-3d){
      .swiper-slide-shadow-left{
        //background-image: linear-gradient(to left, rgba(0,0,0,.1), rgba(0, 0, 0, 0));
        background-image: none;
      }
      .swiper-slide-shadow-right{
        //background-image: linear-gradient(to right, rgba(0,0,0,.1), rgba(0, 0, 0, 0));
        background-image: none;
      }
    }

    &__swiper{
      .swiper-slide{
        border-radius: 20px;
        overflow: hidden;
        //background-color: #ffd7a3;
        //background-color: #fff6ed;
        background-color: rgba(0,0,0,0);
      }
    }
    &__wall{
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      gap: 20px;
      background-color: #FFEAC5;
      border: 3px solid #FCDDB0;
      border-radius: 20px;
      padding: 0 20px;
      align-items: center;

      &__swiper{
        flex-shrink: 0;
        width: 120px;
        height: 120px;

      }
    }
  }
}
.send-gift{
  cursor: pointer;
  text-decoration: underline;
}
</style>