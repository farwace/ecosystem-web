<template>
  <div
      :class="{
              received: item.received,
              completed: item.completed && !item.received,
              locked: item.personalAccess && !subscription?.personalAccess
            }"
      class="item"
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
</template>
<script setup lang="ts">
import UiIcon from "@/components/common/icons/UiIcon.vue";
import type {TDailyMission} from "@/stores/Ecosystem/Types/TDailyMission.ts";
import {storeToRefs} from "pinia";
import {ecosystemStore} from "@/stores/Ecosystem/ecosystemStore.ts";

defineProps<{
  item: TDailyMission
}>();

const {subscription} = storeToRefs(ecosystemStore());

</script>

<style lang="scss" scoped>
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
  cursor: pointer;

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
      ms-filter: saturate(0.5);
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

  &.locked{
    .item{
      &__bonus{
        svg{
          filter: saturate(0.5) contrast(0.5);
          -webkit-filter: saturate(0.5) contrast(0.5);
          -ms-filter: saturate(0.5) contrast(0.5);
        }
      }
    }
  }
}


</style>