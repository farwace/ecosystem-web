<template>
  <c-layout>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in" appear>
          <component :is="Component" />
        </transition>
      </router-view>
  </c-layout>
</template>

<script setup lang="ts">
import CLayout from "@/layouts/MainLayout/CLayout.vue";
</script>

<style scoped lang="scss">
</style>