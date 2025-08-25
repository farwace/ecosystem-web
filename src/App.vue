<template>
  <RouterView />
  <common-notifications />
  <big-gift-notifications />
</template>

<script setup lang="ts">
import {RouterView } from 'vue-router'
import CommonNotifications from "@/components/common/ui/notifications/commonNotifications.vue";
import BigGiftNotifications from "@/components/common/ui/notifications/bigGiftNotifications.vue";
import {storeToRefs} from "pinia";
import {themeStore} from "@/stores/Theme/themeStore.ts";
import {onBeforeMount, watch} from "vue";

const {theme} = storeToRefs(themeStore());

onBeforeMount(() => {
  theme.value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.setAttribute('theme' , theme.value);
});

watch(theme, (neoTheme) => {
  document.documentElement.setAttribute('theme' , neoTheme);
})
</script>


<style scoped>

</style>
