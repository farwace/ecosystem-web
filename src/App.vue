<template>
  <RouterView />
  <common-notifications />
</template>

<script setup lang="ts">
import {RouterView } from 'vue-router'
import {useThemeStore} from "@/stores/theme.ts";
import CommonNotifications from "@/components/common/ui/notifications/commonNotifications.vue";
useThemeStore();
</script>


<style scoped>

</style>
