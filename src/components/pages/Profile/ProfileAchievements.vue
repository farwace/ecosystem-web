<template>
  <div class="profile__achievements">
    <template v-if="(achievements?.length || 0) < 1 && !current">
      <div>
        {{ name }} слишком ленив чтобы забрать достижения
      </div>
    </template>
    <template v-else>
      <div class="achievement__list">
        <template v-for="(achievement, index) in currentAchievements">
          <div v-if="!limit || (!!limit && index < limit)" class="item" :class="{disabled: !achievement.received}">
            <img :src="`/assets/img/achievements/${achievement.code}.svg`" :alt="achievement.code">
          </div>
        </template>
      </div>
    </template>
  </div>
</template>
<script lang="ts" setup>


import {computed} from "vue";
import {storeToRefs} from "pinia";
import {achievementsStore} from "@/stores/Achievements/achievementsStore.ts";
import type {TUserAchievement} from "@/stores/Achievements/Types/TUserAchievement.ts";

const {achievementList} = storeToRefs(achievementsStore());

const props = defineProps<{
  achievements?:TUserAchievement[] | null,
  name?:string,
  current?:boolean,
  limit?: number,
}>();

const currentAchievements = computed(() => {
  if(!props.current && props.achievements?.length || 0 > 0) {
    return props.achievements;
  }
  return achievementList.value.concat()
      .sort((a,b) => {
        return a.sort - b.sort
      })
      .sort((a,b) => {
        if(a.received && !b.received){
          return -1;
        }
        if(!a.received && b.received){
          return 1;
        }
        return 0;
      }).filter((achievement) => {
        return achievement.completed || !achievement.hidden
      }).slice(0, 5);
})

</script>
<style lang="scss" scoped>
.achievement__list{
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  gap: 10px;
  .item{
    &.disabled{
      opacity: 0.5;
    }
  }
}
</style>