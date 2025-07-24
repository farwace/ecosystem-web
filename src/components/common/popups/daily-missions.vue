<template>
  <div>
    <div class="missions-header">
      <div class="title">
        Ежедневные задания
      </div>

      <div class="boxes">

      </div>
    </div>

    <daily-missions-skeleton v-if="isDailyMissionsLoading || dailyMissionList.length < 1" />
    <transition-group name="daily" tag="div" v-else class="daily-missions">

        <div
            v-for="item in sortedItems"
            :key="`daily-mission-${item.id}`"
            :class="{
              received: item.received,
              completed: item.completed && !item.received,
              locked: item.personalAccess && !subscription?.personalAccess
            }"
            class="item"
            @click="tryReceive(item)"
        >
          <div class="item__check">
            <UiIcon v-if="item.personalAccess && !subscription?.personalAccess" name="lock" class="check-icon" />
            <UiIcon v-else-if="item.received || item.completed" class="check-icon" name="check"/>
            <div class="progress" v-else>
              {{ item.replays }} / {{item.eventReplays}}
            </div>
          </div>
          <div class="item__name">
            {{ item.name }}
          </div>
          <div
              v-show="item.completed && !item.received"
              class="receive-outer"
          >
            <span class="receive-btn">
              Забрать
            </span>
          </div>
          <div
              v-if="!(item.completed && !item.received)"
              class="item__bonus"
          >
            <div class="experience">
              <template v-if="item.experience && item.experience > 0">
                {{ item.experience }}
                <UiIcon class="small-icon" name="experience" />
              </template>
            </div>
            <div class="coin">
              <template v-if="item.coins && item.coins > 0">
                {{ item.coins }}
                <UiIcon class="small-icon" name="coin" />
              </template>
            </div>
          </div>
        </div>

    </transition-group>
  </div>
</template>
<script lang="ts" setup>

import {computed, inject, onMounted} from "vue";
import {UserProviderSymbol} from "@/modules/ApiModule/symbols.ts";
import type {IUserProvider} from "@/modules/ApiModule/Interfaces/IUserProvider.ts";
import {storeToRefs} from "pinia";
import {dailyMissionsStore} from "@/stores/DailyMissions/dailyMissionsStore.ts";
import DailyMissionsSkeleton from "@/components/common/ui/sceleton/dailyMissionsSkeleton.vue";
import {ecosystemStore} from "@/stores/Ecosystem/ecosystemStore.ts";
import UiIcon from "@/components/common/icons/UiIcon.vue";
import type {TDailyMission} from "@/stores/Ecosystem/Types/TDailyMission.ts";

const userProvider: IUserProvider | undefined = inject(UserProviderSymbol);
const {dailyMissionsHasBeenLoaded, dailyMissionsLoadingError, dailyMissionList, isDailyMissionsLoading} = storeToRefs(dailyMissionsStore());
const {subscription} = storeToRefs(ecosystemStore());

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
  if(item.completed){
    if(item.personalAccess && !subscription?.value?.personalAccess){
      //todo: Вывести попап с информацией что это для PREMIUM доступа
      alert('Вывести попап с информацией что это для PREMIUM доступа')
    }
    else{
      item.received = true;
      //alert('Отправить запрос на backend для получения награды')
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
  z-index: 2;
  top: 0;
  padding-top: 20px;
  padding-bottom: 20px;
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
  margin-bottom: 60px;

  color: #C99965;
  background-color: #FEE8C7;
  border: 3px solid #F7D7AD;
}


.boxes{
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


.daily-missions{
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 5px;

  .item{
    padding: 10px;
    background-color: var(--box-bg);
    border-color: var(--box-border);
    border-width: 3px;
    border-style: solid;
    border-radius: 12px;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    font-size: 14px;
    line-height: 16px;
    gap: 8px;
    font-weight: 500;
    align-items: center;

    &.received{
      opacity: 35%;
      .item{
        &__check{
          background-color: #FFAF7B;
          color: var(--white);
        }
      }
    }

    &.completed{
      .item{
        &__check{
          background-color: #7eba70;
          color: var(--box-bg);
        }
      }
    }

    &.locked{
      background-color: #eee2d0;
      border-color: #cfc2b1;
      color: #8f8677;
      .item{
        &__check{
          background-color: #dacdbd;
          color: #988e82;
        }
      }

      .receive-btn{
        filter: saturate(0.5);
        -webkit-filter: saturate(0.5);
      }
    }

    &__check{
      width: 29px;
      height: 29px;
      border-radius: 100%;
      background-color: #FFEACC;
      flex-shrink: 0;
      display: flex;
      justify-content: center;
      align-items: center;

      .progress{
        font-size: 10px;
      }
      .check-icon{
        width: 17px;
        height: 17px;
      }
    }


    &__name{
      line-height: 14px;
    }
    &__bonus{
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-left: auto;
      flex-shrink: 0;
      .experience, .coin{
        display: flex;
        flex-wrap: nowrap;
        justify-content: end;
        gap: 4px;
        svg{
          flex-shrink: 0;
        }
      }
    }

    .small-icon{
      width: 14px;
      height: 14px;
    }

    .receive-outer{
      flex-shrink: 0;
      margin-left: auto;

      .receive-btn{
        display: block;
        background-color: #7eba70;
        border-color: #6fb75c;
        color: var(--box-bg);
        font-weight: 600;
        border-radius: 8px;
        padding: 6px 10px;
        line-height: 15px;
      }
    }
  }

  :deep(.item){
    &.locked{
      .item{
        &__bonus{
          svg{
            filter: saturate(0.5) contrast(0.5);
            -webkit-filter: saturate(0.5) contrast(0.5);
          }
        }
      }
    }
  }
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

</style>