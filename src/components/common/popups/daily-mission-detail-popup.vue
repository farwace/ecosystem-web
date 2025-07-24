<template>
  <div class="detail-mission">
    <div>{{ item?.description }}</div>

    <div v-if="item.personalAccess && !subscription?.personalAccess" class="item-personal-access">
      Награда за выполнение доступна только с премиум доступом!
      <div v-if="canUseTrialSubscription" class="get-free-subscription" @click="openSubscriptionModal">
        Попробовать бесплатно
      </div>
    </div>

    <div class="item-progress">
      <div>
        Прогресс:
      </div>
      <div class="progress-value" v-if="item.replays < item.eventReplays">
        {{ item.replays }} / {{ item.eventReplays }}
      </div>
      <div class="progress-value progress-check" v-else>
        Выполнено <UiIcon name="check" class="small-icon"/>
      </div>
    </div>
    <div class="item-bonus">
      <div class="">
        Награда за выполнение:
      </div>
      <div class="values">
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
  </div>
</template>
<script lang="ts" setup>
import type {TDailyMission} from "@/stores/Ecosystem/Types/TDailyMission.ts";
import UiIcon from "@/components/common/icons/UiIcon.vue";
import {storeToRefs} from "pinia";
import {ecosystemStore} from "@/stores/Ecosystem/ecosystemStore.ts";

const {subscription, canUseTrialSubscription} = storeToRefs(ecosystemStore());

defineProps<{
  item:TDailyMission
}>();

const openSubscriptionModal = () => {
  //todo: Вывод попапа с покупкой премиум подписки
  alert('Купите подписку!')
}

</script>
<style lang="scss" scoped>
.item-bonus{
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 20px;
  margin-top: 5px;
  align-items: center;
  font-size: 14px;

  .values{
    flex-shrink: 0;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 5px;
  }

  .experience, .coin{
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    gap: 5px;

    svg{
      flex-shrink: 0;
    }
  }
}

.item-progress{
  font-size: 14px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
}

.small-icon{
  width: 24px;
  height: 24px;
}

.progress-check{
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  gap: 5px;
  svg{
    color: #7eba70;
  }
}
.item-personal-access{
  font-size: 16px;
  text-align: center;
  margin-top: 20px;
  //background-color: #c6e4f1;
  //border: 3px solid #94acda;
  //color: #7d6b6b;
  background-color: #f1c6c6;
  border: 3px solid #da9494;
  color: #7d6b6b;
  border-radius: 12px;
  padding: 8px 12px;

  font-weight: 600;

}

.get-free-subscription{
  margin-top: 10px;
  background-color: #7eba70;
  border-color: #6fb75c;
  border-radius: 8px;
  padding: 6px 12px;
  color: var(--white);
  text-transform: uppercase;
  cursor: pointer;

  transition: background-color .3s ease-out;

  &:hover{
    background-color: #62a252;
  }
}
</style>