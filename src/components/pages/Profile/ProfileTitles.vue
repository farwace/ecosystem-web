<template>
  <div class="profile__titles" v-if="profile">
    <div class="exp item" v-if="cLvl">
      <ui-icon name="experience" class="title-icon"/>
      Lv. {{ cLvl }}
    </div>
    <div class="pop item popularity-level" v-if="(cPopularityLevel || 0) > 0">
      <img :src="popularityPhoto(cPopularityLevel)">
      <span>{{ cPopularityLevel }}</span>
    </div>
    <!-- Если премиум пользователь - отображать VIP -->
  </div>
</template>
<script lang="ts" setup>
import type {TUserProfile} from "@/modules/ApiModule/Types/TUserProfile.ts";
import UiIcon from "@/components/common/icons/UiIcon.vue";
import {computed} from "vue";
import {storeToRefs} from "pinia";
import {ecosystemStore} from "@/stores/Ecosystem/ecosystemStore.ts";

const {id, popularity, popularityLevel, nextLevelPopularity, experience, nextLevelExperience, lvl} = storeToRefs(ecosystemStore());

const props = defineProps<{
  profile?:TUserProfile
}>();

const cPopularityLevel = computed(() => {
  if(props.profile?.id == id.value) {
    return popularityLevel.value;
  }
  return props.profile?.popularityLevel;
});

const cLvl = computed(() => {
  if(props.profile?.id == id.value) {
    return lvl.value;
  }
  return props.profile?.lvl;
});

const popularityPhoto = (level?: number) => {
  if(!level){
    return '';
  }
  if(level < 4){
    return `/assets/img/popularity/star.png`;
  }
  if(level < 7){
    return `/assets/img/popularity/diamond.png`;
  }
  if(level < 10){
    return `/assets/img/popularity/crown.png`;
  }
  if(level < 13){
    return `/assets/img/popularity/crown2.png`;
  }
  if(level < 16){
    return `/assets/img/popularity/crown3.png`;
  }
  if(level < 19){
    return `/assets/img/popularity/crown4.png`;
  }
  if(level < 22){
    return `/assets/img/popularity/wreath.png`;
  }
  return `/assets/img/popularity/super-star.png`;
}

</script>
<style lang="scss" scoped>
.profile{
  &__titles{
    margin-top: 180px;
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    gap: 8px;

    .exp{
      background-color: #FF9379;
      color: #FFEFC2;
    }
    .pop{
      background-color: #E0CEF0;
      color: var(--white);
    }

    .title-icon{
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    .item{
      font-size: 16px;
      font-weight: 600;
      padding: 3px 6px 3px 3px;
      border-radius: 9px;
      display: flex;
      flex-wrap: nowrap;
      flex-direction: row;
      gap: 2px;
      line-height: 16px;
      height: 22px;
      align-items: center;

      &.popularity-level{
        img{
          width: 18px;
          height: 18px;
          margin-bottom: 2px;
        }
      }
    }
  }
}
</style>