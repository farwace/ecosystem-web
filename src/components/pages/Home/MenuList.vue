<template>
  <menu-item @click="openMissions" icon="checklist">Задания</menu-item>
  <menu-item @click="openRating" icon="rating">Рейтинг</menu-item>
  <menu-item @click="openFriends" icon="friends">Друзья</menu-item>
  <menu-item @click="openMessages" icon="message">Сообщения</menu-item>
</template>
<script setup lang="ts">
import MenuItem from "@/components/pages/Home/MenuItem.vue";
import {inject} from "vue";
import {NotificationsSymbol} from "@/modules/NotificationsModule/symbols.ts";
import type {INotificationsProvider} from "@/modules/NotificationsModule/Interfaces/INotificationsProvider.ts";
const notificationsProvider: INotificationsProvider | undefined = inject(NotificationsSymbol);

const openMissions = () => {
  notificationsProvider?.addPopup('missions', 'simple-popup', {
    title: 'Задания',
    backdropBlur: true,
    darkBg: true,
  })
}

const openRating = () => {
  notificationsProvider?.addPopup('rating', 'simple-popup', {
    title: 'Рейтинг',
    backdropBlur: true,
    darkBg: true
  })
}

const openFriends = () => {
  notificationsProvider?.addPopup('friends', 'simple-popup', {
    title: 'Друзья',
    backdropBlur: true,
    darkBg: true,
  })
}

const openMessages = () => {
  notificationsProvider?.addPopup('messages', 'simple-popup', {
    title: 'Сообщения',
    backdropBlur: true,
    darkBg: true,
  })
}



</script>