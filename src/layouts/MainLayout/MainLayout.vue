<template>
  <c-layout>
      <router-view v-slot="{ Component }">
        <transition :name="isAnimated ? 'fade' : undefined" :mode="isAnimated ? 'out-in' : undefined" :appear="isAnimated" :css="isAnimated">
          <component :is="Component" />
        </transition>
      </router-view>
  </c-layout>
</template>

<script setup lang="ts">
import CLayout from "@/layouts/MainLayout/CLayout.vue";
import {storeToRefs} from "pinia";
import {ecosystemStore} from "@/stores/Ecosystem/ecosystemStore.ts";
import {computed} from "vue";
const { animateRoute, customSwipeSettings } = storeToRefs(ecosystemStore());

const isAnimated = computed(() => {
  return customSwipeSettings.value && animateRoute.value
})

</script>

<style scoped lang="scss">
</style>