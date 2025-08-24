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
import {ecosystemStore} from "@/stores/Ecosystem/ecosystemStore.ts";
import {computed} from "vue";
import {useRoute} from "vue-router";
const { animateRoute, customSwipeSettings } = storeToRefs(ecosystemStore());

const route = useRoute();
const isAnimated = computed(() => {
  return (customSwipeSettings.value && animateRoute.value) || !customSwipeSettings.value
})

</script>

<style scoped lang="scss">
</style>