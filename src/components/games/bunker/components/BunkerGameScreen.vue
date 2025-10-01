<template>
  <div class="screen">
    <div class="screen__inner" @click="onScreenClick">
      <div v-if="(timer || 0) > 0">
        <div :class="{fire: fire}">
          {{ normalizedTimer }}
        </div>
      </div>
      <div v-else-if="text" :class="size">
        {{ text }}
      </div>
    </div>
    <transition name="opacity">
      <div v-if="subText" class="screen__subtext">
        {{ subText }}
      </div>
    </transition>
  </div>
</template>
<script lang="ts" setup>
import {computed} from "vue";
import type {TGameStage, TRoomStatus, TScenario} from "@/components/games/bunker/types.ts";
import {PreparedTimerString} from "@/classes/utils/PreparedTimerString.ts";

const props = defineProps<{
  maxHeight: number,
  text?: string,
  size?: string,
  scenario?: TScenario,
  timer?: number,
  stage?: TGameStage,
  round?: number,
  roomStatus?: TRoomStatus,
  fire?: boolean,
  iAmSpeak?: boolean,
}>();

const emits = defineEmits(['showScenario']);
const onScreenClick = () => {
  if(props.scenario) {
    emits('showScenario');
  }
}

const maxHeight = computed(() => {
  if(!props.maxHeight) {
    return 'unset';
  }
  return `${props.maxHeight}px`;
});

const screenBackgroundImage = computed(() => {
  if(props.scenario?.smallImageUrl){
    return `url(${props.scenario.smallImageUrl})`;
  }
  return "url('/assets/img/games/bunker/bunker-border-filled.png')";
})

const subText = computed(() => {
  if(props.roomStatus == 'starting' && (props.timer || 0) > 0){
    return 'Начало игры...'
  }
  if(props.roomStatus == 'playing'){
    if(props.stage == 'voting'){
      return 'Голосование'
    }
    if(props.stage == 'card_reveal' && (props.round || 0) > 0){
      return 'Раунд ' + props.round;
    }
    if(props.stage == 'introduction' && (props.round || 0) == 0){
      return 'Знакомство';
    }
    if(props.stage == 'results' && (props.timer || 0) > 0){
      //return 'Результаты';
    }
  }
  if(props.roomStatus == 'finished'){
    return 'Конец игры'
  }

  return '';
})

const normalizedTimer = computed(() => {
  if(!props.timer) {
    return '';
  }
  let time = props.timer;
  if(props.iAmSpeak){
    time -= 6;
    if(time < 0){
      time = 0;
    }
  }
  return PreparedTimerString(time);

});

</script>
<style lang="scss" scoped>

.screen{
  color: #F5D8B6;
  font-size: 20px;
  font-weight: bold;
  margin-left: auto;
  margin-right: auto;
  width: 338px;
  height: 202px;
  max-height: v-bind(maxHeight);
  display: flex;
  flex-direction: column;
  text-align: center;
  align-items: center;
  justify-content: center;

  &__inner{
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    background-image: v-bind(screenBackgroundImage);
    height: 100%;
    max-width: calc(100% - 80px);
    padding: 15px 16px;
    aspect-ratio: 17/10;
    text-wrap: wrap;
    word-wrap: break-word;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    .small{
      font-size: 12px;
    }

    .fire{
      transition: color .3s ease-out;
      color: #ff1d1d;
    }
  }

  &__subtext{
    position: absolute;
    bottom: -18px;
    font-size: 12px;
    font-weight: normal;
    background-color: rgba(0,0,0,.3);
    padding: 2px 10px;
    border-radius: 2px;
  }
}

@media(min-height: 630px){
  .screen{
    &__inner{
      .small{
        font-size: 16px;
      }
    }
  }
}
</style>