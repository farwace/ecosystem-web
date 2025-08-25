<template>
  <div
      class="missions"
      :class="{loading: isLoading}"
  >
    <div class="missions-header">
      <div class="title">
        Достижения
      </div>
    </div>
    <div class="missions-content">
      <div
          v-for="(section, key) in availableSections"
          :key="`user-${props.id}-achievement-section-${section.id}`"
          class="section"
          :style="{
            borderColor: section.borderColor,
          }"
      >

        <div
            class="section__title"
            :style="{
              borderColor: section.borderColor,
              color: section.borderColor,
              background: section.backgroundColor,
            }"
        >
          {{ section.name }}
        </div>

        <div class="section__body" ref="sectionBody">
          <template v-if="id == props.id">
            <template v-for="achievement in achievementList">
              <achievement @receive="receiveAchievement(achievement)" :outer-container="sectionBody?.[key]" :achievement="achievement" v-if="achievement.sectionId == section.id" :key="`user-${props.id}-achievement-${achievement.id}`"/>
            </template>
          </template>
          <template v-else>

          </template>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>

import {computed, inject, ref} from "vue";
import {Dropdown as VDropdown, vTooltip} from "floating-vue";
import 'floating-vue/dist/style.css'
import {achievementsStore} from "@/stores/Achievements/achievementsStore.ts";
import {storeToRefs} from "pinia";
import {ecosystemStore} from "@/stores/Ecosystem/ecosystemStore.ts";
import Achievement from "@/components/common/popups/Achievements/Achievement.vue";
import type {TUserAchievement} from "@/stores/Achievements/Types/TUserAchievement.ts";
import {UserProviderSymbol} from "@/modules/ApiModule/symbols.ts";
import type {IUserProvider} from "@/modules/ApiModule/Interfaces/IUserProvider.ts";

const isLoading = ref<boolean>(false);

const {achievementList, achievementSections} = storeToRefs(achievementsStore());
const {id} = storeToRefs(ecosystemStore());
const userProvider: IUserProvider | undefined = inject(UserProviderSymbol);
const sectionBody = ref<HTMLDivElement[]>();

const props = defineProps<{
  id?: number,
  recentAchievements?: TUserAchievement[]
}>()

defineOptions({
  components: {
    VDropdown,
  },
  directives: {
    vTooltip
  }
})

const availableSections = computed(() => {
  if(id.value == props.id){
    return achievementSections.value.filter((s) => {
      return achievementList.value.some(e => e.sectionId == s.id)
    });
  }
  else{
    return achievementSections.value.filter((s) => {
      return props.recentAchievements?.some?.(e => e.sectionId == s.id)
    });
  }
});


const receiveAchievement = async (achievement: TUserAchievement) => {
  if(isLoading.value) return;
  isLoading.value = true;
  try {
    await userProvider?.receiveAchievement(achievement.id);
  }
  catch (e:any){}
  finally {
    isLoading.value = false;
  }
}

</script>
<style scoped lang="scss">
[theme="dark"]{
  .title{
    color: #939393;
    background-color: #222222;
    border-color: #363738;
  }

  .missions{
    &.loading{
      &:before{
        background-color: rgba(255, 255, 255, 0.1);
      }
    }
  }
}


.missions{
  position: relative;
  padding: 0 10px 16px;
  &.loading{
    pointer-events: none;
    &:before{
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.4);
      z-index: 20000;
    }
  }
}

.missions-header{
  position: sticky;
  z-index: 10001;
  top: 0;
  padding-top: 20px;
  padding-bottom: 15px;
  margin-bottom: 10px;
  background-color: var(--bg-color-component);
  padding-right: 5px;
}
.title{
  font-size: 24px;
  line-height: 22px;
  font-weight: bold;
  text-align: center;
  padding: 10px 12px;
  border-radius: 100px;

  color: #C99965;
  background-color: #FEE8C7;
  border: 3px solid #F7D7AD;
}

.missions-content{
  padding-right: 5px;

  .section{
    padding: 0;
    border-radius: 25px;
    border: 3px solid;
    margin-bottom: 24px;

    &__title{
      border-radius: 25px;
      border: 3px solid;
      margin: -3px -3px 4px;

      text-transform: uppercase;
      font-weight: bold;
      font-size: 20px;
      padding: 16px 20px;
      text-align: center;
    }

    &__body{
      padding: 16px;
      display: flex;
      flex-wrap: wrap;
      gap: 10px 0;
      justify-content: space-between;
      align-items: flex-start;

      :deep(.achievement){
        max-width: calc(20% - 1px);
      }
    }
  }
}
</style>