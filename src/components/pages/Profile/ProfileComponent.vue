<template>
  <div class="profile-page">
    <div class="top-buttons" v-if="!modal">
      <img src="/assets/img/chevron-left.png" alt="<" class="back-btn" @click="() => router.back()">
    </div>
    <profile-swiper :profile="profile"/>
    <div class="page-container">
      <div class="profile__name">
        <div class="profile__name__value">
          {{ profile?.name ? profile.name : 'Профиль не найден' }} <span v-if="profile?.online" class="online"></span>
        </div>
        <div class="profile-edit-btn" v-if="!modal && profile?.id === id" @click="editProfileModal">
          Редактировать
        </div>
      </div>
      <profile-titles :profile="profile"/>
      <profile-gifts v-if="(profile?.topGifts?.length || 0) > 0" :gifts="profile?.topGifts" />
      <profile-fans v-if="(profile?.topFans?.length || 0) > 0" :fans="profile?.topFans" />
      <profile-achievements v-if="(profile?.lastAchievements?.length || 0) > 0" :fans="profile?.lastAchievements" />

      <div class="bottom-buttons">
        <div class="btn btn-add">
          <UiIcon name="invite" />
          Добавить
        </div>
        <div class="btn btn-gift">
          <UiIcon name="gift" />
          Подарок
        </div>
        <div class="btn btn-msg">
          <ui-icon name="msg" />
          Сообщение
        </div>
      </div>
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
import {NotificationsSymbol} from "@/modules/NotificationsModule/symbols.ts";
import type {INotificationsProvider} from "@/modules/NotificationsModule/Interfaces/INotificationsProvider.ts";
import ProfileGifts from "@/components/pages/Profile/ProfileGifts.vue";
import ProfileFans from "@/components/pages/Profile/ProfileFans.vue";
import ProfileAchievements from "@/components/pages/Profile/ProfileAchievements.vue";
import UiIcon from "@/components/common/icons/UiIcon.vue";

const route = useRoute();
const router = useRouter();
const {id} = storeToRefs(ecosystemStore());

const notificationProvider: INotificationsProvider | undefined = inject(NotificationsSymbol);

const props = defineProps<{
  profileId?: number | string,
  modal?: boolean
}>();

const isSelfProfile = computed(() => {
  return id.value == props.profileId;
})

const userProvider:IUserProvider | undefined = inject(UserProviderSymbol);
const profile = ref<TUserProfile | undefined>();
const isLoading = ref<boolean>(true);

profile.value = (await userProvider?.getProfile(props.profileId as unknown as number))?.data;





const editProfileModal = () => {
  notificationProvider?.addPopup('edit-profile', 'simple-popup', {
    modal: true,
    title: "Редактировать профиль",
    message: "TODO: редактирование профиля",
    darkBg: true
  })
}



onMounted(async () => {
  if(!props.profileId || !parseInt(props.profileId.toString())){
    await router.push({path: '/', replace: true});
  }


});



</script>
<style lang="scss" scoped>
.page-container{
  padding: 16px 20px 60px;
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
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    white-space: nowrap;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 20px;

    &__value{
      overflow: hidden;
      text-overflow: ellipsis;
      position: relative;
      padding-right: 10px;
    }
  }
}

.online{
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 100%;
  background-color: #6fb75c;
  vertical-align: super;
  position: absolute;
  right: 0;
}

.top-buttons{
  position: absolute;
  left: 20px;
  top: 20px;
  z-index: 2;

  .back-btn{
    width: 44px;
    height: 44px;
    padding: 10px;
    left: -10px;
    top: -10px;
    display: block;
    position: relative;
    cursor: pointer;
  }

}

.profile-edit-btn{
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.bottom-buttons{
  position: fixed;
  width: calc(100% - 40px);
  left: 20px;
  bottom: 30px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  z-index: 4;
  gap: 20px;
}

.btn{
  padding: 10px 12px 8px 12px;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  flex-shrink: 0;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  gap: 6px;

  transition: box-shadow .3s ease-out, background-color .3s ease-out;

  svg{
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  &.btn-gift{
    background-color: #FF7E85;
    color: #FFEDCB;
    box-shadow: 0 4px 0 #F06470;
    &:hover{
      background-color: #ef7178;
      box-shadow: 0 4px 0 #dd5864;
    }
  }

  &.btn-msg{
    background-color: #89D8EF;
    color: #FEF5DA;
    box-shadow: 0 4px 0 #64C9EB;
    &:hover{
      background-color: #7fcee4;
      box-shadow: 0 4px 0 #59bbdb;
    }
  }

  &.btn-add{
    background-color: #89D8EF;
    color: #FEF5DA;
    box-shadow: 0 4px 0 #64C9EB;
    &:hover{
      background-color: #7fcee4;
      box-shadow: 0 4px 0 #59bbdb;
    }
  }
}
</style>
