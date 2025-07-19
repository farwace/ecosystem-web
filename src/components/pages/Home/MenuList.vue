<template>
  <menu-item @click="openMissions" icon="checklist">Задания</menu-item>
  <menu-item @click="openRating" icon="rating">Рейтинг</menu-item>
  <menu-item @click="openFriends" icon="friends">Друзья</menu-item>
  <menu-item @click="openMessages" icon="message">Сообщения</menu-item>
</template>
<script setup lang="ts">
import MenuItem from "@/components/pages/Home/MenuItem.vue";

const openMissions = () => {
  alert('Задания')
}

const openRating = () => {
  alert('Рейтинг')
}

const openFriends = () => {
  alert('Друзья')
}

const openMessages = () => {
  alert('Сообщения')
}



</script>