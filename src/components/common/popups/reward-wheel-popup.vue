<template>
  <div class="reward-body">
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
<!--    <div class="controls">
      <button
          v-for="reward in rewards"
          :key="reward.id"
          @click="spinToReward(reward.id)"
      >
        Выбрать: {{ reward.label }}
      </button>
    </div>-->
    <button @click="onWatchAdAndSpin">Случайный спин</button>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import type { Reward } from "@/components/common/popups/RewardWheel/RewardWheel.vue";
import RewardWheel from "@/components/common/popups/RewardWheel/RewardWheel.vue";

const rewards: Reward[] = [
  { id: 'coins10', label: '+10', icon: '🪙' },
  { id: 'flask', label: 'Эл-ка', icon: '🧪' },
  { id: 'coins100', label: '+100', icon: '💰' },
  { id: 'star', label: '⭐', icon: '⭐' },
  { id: 'chest', label: 'Сундук', icon: '🎁' },
  { id: 'boost', label: 'Буст', icon: '⚡' },
  { id: 'potion', label: 'Зелье', icon: '🧴' },
  { id: 'mystery', label: '?', icon: '❓' },
]

const wheelRef = ref<InstanceType<typeof RewardWheel> | null>(null);
async function onWatchAdAndSpin() {
  // Случайный выбор награды для теста
  // const randomIndex = Math.floor(Math.random() * rewards.length)
  // const resultId = rewards[randomIndex].id

  //console.log('Выбранная награда:', rewards[randomIndex].label)

  const resultId = 'star';

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
.reward-body {
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

button {
  padding: 12px 24px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
}

button:hover {
  background: #45a049;
}

.wheel{
  width: 100%;
  padding-top: 100%;
  position: relative;

  &__inner{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
}
</style>