<template>
  <menu-item :class="{unread: hasUnclaimedCompletedMission}" @click="openMissions" icon="checklist">Задания</menu-item>
  <menu-item @click="openRating" icon="rating">Рейтинг</menu-item>
  <menu-item @click="openFriends" icon="friends">Друзья</menu-item>
  <menu-item @click="openMessages" icon="message">Сообщения</menu-item>
</template>
<script setup lang="ts">
import MenuItem from "@/components/pages/Home/MenuItem.vue";
import {inject} from "vue";
import {NotificationsSymbol} from "@/modules/NotificationsModule/symbols.ts";
import type {INotificationsProvider} from "@/modules/NotificationsModule/Interfaces/INotificationsProvider.ts";
import {storeToRefs} from "pinia";
import {dailyMissionsStore} from "@/stores/DailyMissions/dailyMissionsStore.ts";
const notificationsProvider: INotificationsProvider | undefined = inject(NotificationsSymbol);
const { hasUnclaimedCompletedMission } = storeToRefs(dailyMissionsStore());

const openMissions = () => {
  notificationsProvider?.addPopup('daily-missions', 'daily-missions', {
    noTitle:true,
    darkBg: true,
  })
}

const openRating = () => {
  notificationsProvider?.addPopup('rating', 'simple-popup', {
    title: 'Рейтинг',
    darkBg: true,
  })
}

const openFriends = () => {
  notificationsProvider?.addPopup('friends', 'simple-popup', {
    title: 'Друзья',
    darkBg: true,
  })
}

const openMessages = () => {
  notificationsProvider?.addPopup('messages', 'simple-popup', {
    title: 'Сообщения',
    darkBg: true,
  })
}



</script>