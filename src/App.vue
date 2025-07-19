<template>
  <RouterView />

</template>

<script setup lang="ts">
import {RouterView } from 'vue-router'
import {useThemeStore} from "@/stores/theme.ts";
useThemeStore();
</script>


<style scoped>

</style>
