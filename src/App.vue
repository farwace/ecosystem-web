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
import {inject, onBeforeMount, watch} from "vue";
import type {IGameProvider} from "@/modules/GameModule/Interfaces/IGameProvider.ts";
import {GameProviderSymbol} from "@/modules/GameModule/symbols.ts";

const {theme} = storeToRefs(themeStore());
const gameProvider: IGameProvider | undefined = inject(GameProviderSymbol);

onBeforeMount(() => {
  theme.value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.setAttribute('theme' , theme.value);

  let currentHash = window.location.hash;
  if(currentHash.length > 0){
    currentHash = currentHash.replace('#', '');
    gameProvider?.navigateToGame?.(currentHash);
  }
});

watch(theme, (neoTheme) => {
  document.documentElement.setAttribute('theme' , neoTheme);
})
</script>


<style scoped>

</style>
