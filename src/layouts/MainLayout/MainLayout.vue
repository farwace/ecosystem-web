<template>
  <c-layout>
      <router-view v-slot="{ Component }">
        <transition :name="isAnimated ? 'fade' : undefined" :mode="isAnimated ? 'out-in' : undefined" :appear="isAnimated" :css="isAnimated">
          <component :key="route.fullPath" :is="Component" />
        </transition>
      </router-view>
  </c-layout>
</template>

<script setup lang="ts">
import CLayout from "@/layouts/MainLayout/CLayout.vue";
import {storeToRefs} from "pinia";
import {computed} from "vue";
import {useRoute} from "vue-router";
import {themeStore} from "@/stores/Theme/themeStore.ts";
const { animateRoute, customSwipeSettings } = storeToRefs(themeStore());

const route = useRoute();
const isAnimated = computed(() => {
  return (customSwipeSettings.value && animateRoute.value) || !customSwipeSettings.value
})

</script>

<style scoped lang="scss">
</style>