<template>
  <div class="profile__achievements" v-if="achievements">
    Достижения
  </div>
</template>
<script lang="ts" setup>


import type {TAchievement} from "@/stores/Ecosystem/Types/TAchievement.ts";

const props = defineProps<{
  achievements?:TAchievement[]
}>();


</script>
<style lang="scss" scoped>
.profile{
  &__fans{

  }
}
</style>