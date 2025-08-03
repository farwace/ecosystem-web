<template>
  <swiper v-if="!profile" :modules="modules" :pagination="{clickable: true}" class="profile-swiper">
    <swiper-slide>
      <img
          class="slide-img-stub"
          src="/assets/img/rocket.svg"
          alt=""
      >
    </swiper-slide>
  </swiper>
  <swiper v-else :modules="modules" :pagination="{clickable: true}" class="profile-swiper">
    <swiper-slide v-for="i in 2" :key="'slide-'+i">
      <img
          class="slide-img"
          :src="profile.avatar"
          :srcset="profile.avatarBig"
          loading="lazy"
          alt=""
      >
      <!-- todo: вторая картинка профиля - выбранное животное! -->
    </swiper-slide>
  </swiper>

</template>
<script lang="ts" setup>
import type {TUserProfile} from "@/modules/ApiModule/Types/TUserProfile.ts";
import {Swiper, SwiperSlide} from "swiper/vue";
import {Pagination} from "swiper/modules";

import 'swiper/css';
import 'swiper/css/pagination';


const props = defineProps<{
  profile?: TUserProfile
}>();

const modules = [Pagination];


</script>
<style lang="scss" scoped>
.profile-swiper{
  height: 100vw;
  --swiper-pagination-bottom: 22px;
  --swiper-pagination-bullet-inactive-color: #FFF5DC;
  --swiper-pagination-bullet-inactive-opacity: 50%;
  --swiper-pagination-color: #FFF5DC;

  .slide-img{
    object-fit: cover;
    width: 100%;
    height: 100%;
  }

  .slide-img-stub{
    object-fit: contain;
    object-position: center;
    margin: calc(100vw - 200px) auto auto auto;
  }
}
</style>
