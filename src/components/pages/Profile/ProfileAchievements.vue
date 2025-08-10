<template>
  <div class="profile__achievements">
    <template v-if="(achievements?.length || 0) > 0">

    </template>
    <template v-else>
      {{ name }} слишком ленив чтобы забрать достижения
    </template>
  </div>
</template>
<script lang="ts" setup>


import type {TAchievement} from "@/stores/Ecosystem/Types/TAchievement.ts";

const props = defineProps<{
  achievements?:TAchievement[] | null,
  name?:string,
}>();


</script>
<style lang="scss" scoped>
.profile{
  &__fans{

  }
}
</style>