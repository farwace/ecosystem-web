<template>
  <RouterView v-if="applicationState.ready" />
  <AuthScreen v-else-if="isWeb" />
  <div v-else role="status" style="padding: 32px">{{ applicationState.error || 'Загрузка LAPA PLAY…' }}</div>
  <common-notifications v-if="!isWeb || applicationState.ready" />
  <big-gift-notifications v-if="!isWeb || applicationState.ready" />
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
import {useAnimatedRouter} from "@/classes/utils/useAnimatedRouter.ts";
import AuthScreen from '@/auth/AuthScreen.vue';
import {applicationState} from '@/auth/web-session';
import {isWeb} from '@/platform/launch';

const {theme} = storeToRefs(themeStore());
const gameProvider: IGameProvider | undefined = inject(GameProviderSymbol);

const router = useAnimatedRouter();

onBeforeMount(() => {
  gameProvider?.setRouter(router);
  theme.value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.setAttribute('theme' , theme.value);

});

watch(() => applicationState.ready, (ready) => {
  if (!ready || isWeb) return;
  let currentHash = window.location.hash;
  if(currentHash.length > 0){
    currentHash = currentHash.replace('#', '');
    gameProvider?.navigateToGame?.(currentHash);
  }
}, {immediate: true});

watch(theme, (neoTheme) => {
  document.documentElement.setAttribute('theme' , neoTheme);
});
</script>


<style scoped>

</style>
