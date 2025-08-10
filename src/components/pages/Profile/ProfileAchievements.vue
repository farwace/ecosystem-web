<template>
  <div class="profile__achievements">
    <template v-if="(achievements?.length || 0) < 1 && !current">
      <div>
        {{ name }} слишком ленив чтобы забрать достижения
      </div>
    </template>
    <template v-else>
      <div>
        todo: список достижений
      </div>
    </template>
  </div>
</template>
<script lang="ts" setup>


import type {TAchievement} from "@/stores/Ecosystem/Types/TAchievement.ts";
import {computed} from "vue";

const props = defineProps<{
  achievements?:TAchievement[] | null,
  name?:string,
  current?:boolean
}>();

const currentAchievements = computed(() => {
  if(props.achievements?.length || 0 > 0) {
    return props.achievements;
  }

})

</script>
<style lang="scss" scoped>
.profile{
  &__fans{

  }
}
</style>