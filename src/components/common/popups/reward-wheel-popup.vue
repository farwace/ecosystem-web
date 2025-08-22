<template>
  <div
      class="reward"
      :class="{loading: isLoading}"
  >
    <div class="reward-header">
      <div class="title">
        Колесо фортуны
      </div>
      <div class="subtitle">После просмотра рекламы выпадет случайная награда</div>
    </div>

    <div class="wheel__outer">
      <div class="wheel">
        <div class="wheel__inner">
          <RewardWheel
              ref="wheelRef"
              :rewards="rewards"
              :duration="5200"
              @start="onStart"
              @finished="onFinished"
          />
        </div>
      </div>
    </div>
    <div class="reward-button">
      <div class="btn" @click="onWatchAdAndSpin">
        <UiIcon name="gift" />
        Смотреть и вращать
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import type { Reward } from "@/components/common/popups/RewardWheel/RewardWheel.vue";
import RewardWheel from "@/components/common/popups/RewardWheel/RewardWheel.vue";
import UiIcon from "@/components/common/icons/UiIcon.vue";

const isLoading = ref<boolean>(false);

const rewards: Reward[] = [
  { id: 'coins5', label: '5', icon: 'coin' },
  { id: 'coins15', label: '15', icon: 'low-money' },
  { id: 'coins5-1', label: '5', icon: 'coin' },
  { id: 'coins1000', label: '1000', icon: 'big-money' },
  { id: 'coins10', label: '10', icon: 'coin' },
  { id: 'coins-5-2', label: '5', icon: 'coin' },
  { id: 'coins10-1', label: '10', icon: 'coin' },
  { id: 'coins50', label: '50', icon: 'middle-money' },
]
// const rewards: Reward[] = [
//   { id: 'coins10', label: '+10', icon: '🪙' },
//   { id: 'flask', label: 'Эл-ка', icon: '🧪' },
//   { id: 'coins100', label: '+100', icon: '💰' },
//   { id: 'star', label: '⭐', icon: '⭐' },
//   { id: 'chest', label: 'Сундук', icon: '🎁' },
//   { id: 'boost', label: 'Буст', icon: '⚡' },
//   { id: 'potion', label: 'Зелье', icon: '🧴' },
//   { id: 'mystery', label: '?', icon: '❓' },
// ]

const wheelRef = ref<InstanceType<typeof RewardWheel> | null>(null);
async function onWatchAdAndSpin() {
  // Случайный выбор награды для теста
  const randomIndex = Math.floor(Math.random() * rewards.length)
  const resultId = rewards[randomIndex].id

  console.log('Выбранная награда:', rewards[randomIndex].label)

  //const resultId = 'star';

  await wheelRef.value?.spinToId(resultId, {
    spins: 15,
    durationMs: 7000
  })
}

function onStart() {
  console.log('Колесо начало вращаться')
}

function onFinished(payload: { index: number; reward: Reward }) {
  console.log('Выпала награда:', payload.reward.label)
  console.log('Ожидалось:', rewards[payload.index].label)
}
</script>

<style lang="scss" scoped>
.reward {
  position: relative;
  padding: 0 15px 25px;

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

.reward-header{
  position: relative;
  z-index: 10001;
  top: 0;
  padding-top: 20px;
  padding-bottom: 5px;
  margin-bottom: 0;
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
  margin-bottom: 0;

  color: #C99965;
  background-color: #FEE8C7;
  border: 3px solid #F7D7AD;
}
.subtitle{
  font-size: 14px;
  text-align: center;
  margin-top: 5px;
}

.wheel{
  width: 100%;
  padding-top: 100%;
  position: relative;

  &__outer{
    position: relative;
    max-width: 392px;
    max-height: 392px;
    margin-left: auto;
    margin-right: auto;
  }

  &__inner{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
}

.reward-button{
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  .btn{
    padding: 10px 12px 8px 12px;
    border-radius: 100px;
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    flex-shrink: 0;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    gap: 6px;
    transition: box-shadow 0.3s ease-out, background-color 0.3s ease-out;

    background-color: #FF7E85;
    color: #FFEDCB;
    box-shadow: 0 4px 0 #F06470;
    &:hover{
      background-color: #ef7178;
      box-shadow: 0 4px 0 #dd5864;
    }

    svg{
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }
  }
}
</style>