<template>
  <div class="profile-page">
    <!-- todo: если это профиль текущего профиля - дать возможнсть редактировать -->
    <!-- todo: если открыто не в попап окне - добавить кнопку "НАЗАД"!! -->
    <profile-swiper :profile="profile"/>
    <div class="page-container">
      <div class="profile__name">
        {{ profile?.name }}
      </div>
      <profile-titles :profile="profile"/>
<!-- todo: вывод информации о профиле - подарки, посетители, достижения -->
<!--
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <pre>
        {{route.params}}
      </pre>
      <pre>
        {{ profile }}
      </pre> -->
    </div>
  </div>
</template>
<script lang="ts" setup>
import {useRoute, useRouter} from "vue-router";
import {computed, inject, onMounted, ref} from "vue";
import type {IUserProvider} from "@/modules/ApiModule/Interfaces/IUserProvider.ts";
import {UserProviderSymbol} from "@/modules/ApiModule/symbols.ts";
import type {TUserProfile} from "@/modules/ApiModule/Types/TUserProfile.ts";
import ProfileSwiper from "@/components/pages/Profile/ProfileSwiper.vue";
import ProfileTitles from "@/components/pages/Profile/ProfileTitles.vue";
import {storeToRefs} from "pinia";
import {ecosystemStore} from "@/stores/Ecosystem/ecosystemStore.ts";

const route = useRoute();
const router = useRouter();
const {id} = storeToRefs(ecosystemStore());

const props = defineProps<{
  profileId?: number
}>();

const isSelfProfile = computed(() => {
  return id.value == props.profileId;
})

const userProvider:IUserProvider | undefined = inject(UserProviderSymbol);
const profile = ref<TUserProfile | undefined>();
const isLoading = ref<boolean>(true);


onMounted(async () => {
  if(!props.profileId || !parseInt(props.profileId.toString())){
    await router.push({path: '/', replace: true});
  }

  isLoading.value = true;
  try {
    profile.value = (await userProvider?.getProfile(props.profileId as unknown as number))?.data;
    if(!profile.value){
      //todo: вывод заглушки что страница не найдена
    }
  }
  catch (e: any){
  }
  finally {
    isLoading.value = false;
  }

});



</script>
<style lang="scss" scoped>
.page-container{
  padding: 16px 20px 30px;
  border-radius: 14px 14px 0 0;
  margin-top: -14px;
  position: relative;
  z-index: 2;
  background-color: inherit;
  width: 100%;
  overflow-x: hidden;
}

.profile-page{
  background-color: inherit;
  height: 100%;
  overflow-y: auto;
  color: #895431;
  position: relative;
}

.profile{
  &__name{
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 18px;
  }
}
</style>
