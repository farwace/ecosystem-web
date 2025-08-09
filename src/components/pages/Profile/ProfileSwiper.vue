<template>
  <swiper v-if="!profile" :modules="modules" :pagination="{clickable: true}" class="profile-swiper">
    <swiper-slide>
      <img
          class="slide-img-stub"
          src="/assets/img/avatar-stub.png"
          alt=""
      >
    </swiper-slide>
  </swiper>
  <swiper v-else :modules="modules" :pagination="{clickable: true}" class="profile-swiper">
    <swiper-slide>
      <img
          class="slide-img"
          :src="profile.avatar"
          :srcset="profile.avatarBig"
          loading="lazy"
          alt=""
      >
    </swiper-slide>
    <swiper-slide>
      <div class="profile-animal">
        <img class="animal-bg" src="/assets/img/profile/default-avatar-bg.png" alt="Профиль">
        <UiIcon class="animal" :name="`animals/${animal}`"/>
      </div>
    </swiper-slide>
  </swiper>

</template>
<script lang="ts" setup>
import type {TUserProfile} from "@/modules/ApiModule/Types/TUserProfile.ts";
import {Swiper, SwiperSlide} from "swiper/vue";
import {Pagination} from "swiper/modules";

import 'swiper/css';
import 'swiper/css/pagination';
import UiIcon from "@/components/common/icons/UiIcon.vue";
import {onMounted, ref} from "vue";


const props = defineProps<{
  profile?: TUserProfile
}>();

const modules = [Pagination];
const animal = ref<string>('tiger');

onMounted(() => {
  if(props.profile?.animal && [
      'cat',
      'chicken',
      'koala',
      'fox',
      'panda',
      'tiger',
  ].indexOf(props.profile.animal) > -1){
    animal.value = props.profile.animal;
  }
})

</script>
<style lang="scss" scoped>
.profile-swiper{
  height: 100vw;
  max-height: 400px;
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

.profile-animal{
  position: relative;
  width: 100%;
  height: 100%;
  .animal{
    position: relative;
    z-index: 2;
    transform: translateX(-50%);
    left: 50%;
    top: 25%;
  }
  img{
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    top: 0;
    left: 0;
  }
}
</style>
