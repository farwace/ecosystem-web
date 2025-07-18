<template>
  <RouterView />

</template>

<script setup lang="ts">
import {RouterView } from 'vue-router'
import {useThemeStore} from "@/stores/theme.ts";
import type {IPlatformEvents} from "@/modules/EventsModule/Interfaces/IPlatformEvents.ts";
import {inject, onMounted} from "vue";
import {PlatformEventsSymbol} from "@/modules/EventsModule/symbols.ts";
import type {IUserProvider} from "@/modules/ApiModule/Interfaces/IUserProvider.ts";
import {UserProviderSymbol} from "@/modules/ApiModule/symbols.ts";

useThemeStore();
const platformEvents: IPlatformEvents | undefined = inject(PlatformEventsSymbol);
const userProvider: IUserProvider | undefined = inject(UserProviderSymbol);

onMounted(async () => {
  await platformEvents?.init();
  await userProvider?.getUserInfo();
  platformEvents?.setApplicationIsReady();
});
</script>


<style scoped>

</style>
