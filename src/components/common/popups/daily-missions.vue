<template>
  <div>
    <div class="missions-header">
      <div class="title">
        Ежедневные задания
      </div>

      <daily-mission-gifts />

    </div>
    <div ref="missionsContainer">
      <daily-missions-skeleton v-if="isDailyMissionsLoading || dailyMissionList.length < 1" />
      <transition-group name="daily" tag="div" v-else class="daily-missions">

        <template
            v-for="item in sortedItems"
            :key="`daily-mission-${item.id}`"
        >
          <VDropdown
              v-if="item.personalAccess && !subscription?.personalAccess"
              :distance="6"
              :placement="'top'"
              :container="missionsContainer"
          >
            <daily-mission-item :item="item" @click="tryReceive(item)" />
            <template #popper>
              <div @click.stop.prevent="">
                <div>
                  Доступно с премиум доступом
                </div>

              </div>
            </template>
          </VDropdown>
          <daily-mission-item v-else :item="item" @click="tryReceive(item)" />

        </template>
      </transition-group>
    </div>
  </div>
</template>
<script lang="ts" setup>

import {computed, inject, onMounted, ref} from "vue";
import {UserProviderSymbol} from "@/modules/ApiModule/symbols.ts";
import type {IUserProvider} from "@/modules/ApiModule/Interfaces/IUserProvider.ts";
import {storeToRefs} from "pinia";
import {dailyMissionsStore} from "@/stores/DailyMissions/dailyMissionsStore.ts";
import DailyMissionsSkeleton from "@/components/common/ui/sceleton/dailyMissionsSkeleton.vue";
import {ecosystemStore} from "@/stores/Ecosystem/ecosystemStore.ts";
import type {TDailyMission} from "@/stores/Ecosystem/Types/TDailyMission.ts";
import DailyMissionItem from "@/components/common/popups/DailyMissions/DailyMissionItem.vue";
import {Dropdown as VDropdown, vTooltip} from "floating-vue";
import 'floating-vue/dist/style.css'
import DailyMissionGifts from "@/components/common/popups/DailyMissions/DailyMissionGifts.vue";


const userProvider: IUserProvider | undefined = inject(UserProviderSymbol);
const {dailyMissionsHasBeenLoaded, dailyMissionsLoadingError, dailyMissionList, isDailyMissionsLoading} = storeToRefs(dailyMissionsStore());
const {subscription, canUseTrialSubscription} = storeToRefs(ecosystemStore());

defineOptions({
  components: {
    VDropdown,
  },
  directives: {
    vTooltip
  }
})


const missionsContainer = ref<HTMLDivElement>();
const sortedItems = computed((): TDailyMission[] => {
  if(!dailyMissionList.value){
    return [];
  }

  return dailyMissionList.value.concat()
      .sort((a,b) => {
        return a.sort - b.sort
      })
      .sort((a,b) => {
        if(a.received && !b.received){
          return 1;
        }
        if(!a.received && b.received){
          return -1;
        }
        return 0;
      })
});


const tryReceive = (item: TDailyMission) => {
  if(item.completed) {
    if (!(item.personalAccess && !subscription?.value?.personalAccess)) {
      userProvider?.receiveMission(item.id);
      return;
    }
  }
}


onMounted(() => {
  if(!isDailyMissionsLoading.value && !dailyMissionsHasBeenLoaded.value){
    userProvider?.loadDailyMissions();
  }
});


</script>
<style scoped lang="scss">
[theme="dark"]{
  .title{
    color: #C99965;
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
  margin-bottom: 45px;

  color: #C99965;
  background-color: #FEE8C7;
  border: 3px solid #F7D7AD;
}


.daily-missions{
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 5px;
}

.daily-move {
  transition: transform 0.5s ease-in;
}

.daily-enter-from,
.daily-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
.daily-enter-active,
.daily-leave-active {
  transition: all 0.3s ease-in;
}
.target-icon{
  width: 12px;
  height: 12px;
}
.btn-buy{
  margin-top: 10px;
  background-color: #FEE8C7;
  border-color: #F7D7AD;
  border-radius: 8px;
  padding: 6px 12px;
  color: #C99965;
  cursor: pointer;
  font-weight: 500;

  transition: background-color .3s ease-out;

  &:hover{
    background-color: #f8deb7;
  }
}

</style>