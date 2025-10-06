<template>
  <menu-item :class="{unread: hasUnclaimedCompletedMission}" @click="openMissions" icon="checklist">Задания</menu-item>
  <menu-item @click="openRating" icon="rating">Рейтинг</menu-item>
  <menu-item @click="openFriends" icon="friends">Друзья</menu-item>

  <VideoRewardAdv />

<!--  <menu-item @click="openMessages" icon="message">Сообщения</menu-item>-->
</template>
<script setup lang="ts">
import MenuItem from "@/components/pages/Home/MenuItem.vue";
import {inject} from "vue";
import {NotificationsSymbol} from "@/modules/NotificationsModule/symbols.ts";
import type {INotificationsProvider} from "@/modules/NotificationsModule/Interfaces/INotificationsProvider.ts";
import {storeToRefs} from "pinia";
import {dailyMissionsStore} from "@/stores/DailyMissions/dailyMissionsStore.ts";
import VideoRewardAdv from "@/components/pages/Home/VideoRewardAdv.vue";
import type {IGameApiProvider} from "@/modules/ApiModule/Interfaces/IGameApiProvider.ts";
import {GameApiProviderSymbol} from "@/modules/ApiModule/symbols.ts";
import type {IPlatformEvents} from "@/modules/EventsModule/Interfaces/IPlatformEvents.ts";
import {PlatformEventsSymbol} from "@/modules/EventsModule/symbols.ts";
const notificationsProvider: INotificationsProvider | undefined = inject(NotificationsSymbol);
const { hasUnclaimedCompletedMission } = storeToRefs(dailyMissionsStore());

const openMissions = () => {
  notificationsProvider?.addPopup('daily-missions', 'daily-missions', {
    noTitle:true,
    darkBg: true,
    noPaddings: true,
  })
}

const openRating = () => {
  notificationsProvider?.addPopup('rating', 'rating-popup', {
    noTitle:true,
    darkBg: true,
    modal: false,
    noPaddings: true,
  })
}


const gameApi: IGameApiProvider | undefined = inject(GameApiProviderSymbol);
const bridgeProvider: IPlatformEvents | undefined = inject(PlatformEventsSymbol);
const openFriends = async () => {
  const res = await gameApi?.loadOnBoarding?.('onboarding');
  if((res?.data?.length || 0)> 0) {
    bridgeProvider?.showSlidesSheet?.(res?.data || []);
  }
  // notificationsProvider?.addPopup('friends', 'simple-popup', {
  //   title: 'Друзья',
  //   darkBg: true,
  // })
}

const openMessages = () => {
  notificationsProvider?.addPopup('messages', 'simple-popup', {
    title: 'Сообщения',
    darkBg: true,
  })
}



</script>