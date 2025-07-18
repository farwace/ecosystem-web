<template>
  <RouterView />

</template>

<script setup lang="ts">
import {RouterView } from 'vue-router'
import {useThemeStore} from "@/stores/theme.ts";
import type {IPlatformEvents} from "@/modules/EventsModule/Interfaces/IPlatformEvents.ts";
import {inject, onMounted} from "vue";
import {PlatformEventsSymbol} from "@/modules/EventsModule/symbols.ts";

useThemeStore();
const platformEvents: IPlatformEvents | undefined = inject(PlatformEventsSymbol);

onMounted(() => {
  platformEvents?.init();
})
</script>


<style scoped>

</style>
