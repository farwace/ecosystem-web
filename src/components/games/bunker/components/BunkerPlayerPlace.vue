<template>
  <div class="place" @click.prevent="handleClick">
    <div class="place__self" v-if="isSelf">
      Это Вы
    </div>
    <UiIcon v-if="isHost" name="sunglasses" class="place__circle__host" />
    <div class="place__circle" :style="{'--avatar': player?.avatar}">
      <UiIcon v-if="!player" name="icon-plus" class="place__circle__plus" />
      <div class="place__position">{{ +place+1 }}</div>
    </div>
    <div class="place__plate">
      <div class="player-name">
        <div class="absolute-marquee-text" v-if="player" v-marquee="'scroll'">
          {{ player?.name }}
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type {Player} from "@/components/games/bunker/schemas/schemas/Player.ts";
import {computed} from "vue";
import UiIcon from "@/components/common/icons/UiIcon.vue";
import {vMarquee} from "@/classes/directives/marquee.ts";

const props = defineProps<{
  place: number | string,
  playerId: number,
  player?: Player,
  disconnected?: boolean,
  eliminated?: boolean,
  isHost?: boolean,
  isSpeaker?: boolean,
  isSelf?: boolean,
}>();

const emit = defineEmits(['touch-player', 'touch-place']);

const avatarUrl = computed(() => {
  if(props.player?.avatar){
    return `url(${props.player?.avatar})`;
  }
  return 'none';
});

const handleClick = () => {
  if(!props.player?.id){
    emit("touch-place");
    return;
  }
  if(props.player?.id){
    emit("touch-player");
    return;
  }
}

</script>
<style lang="scss" scoped>
.place{
  position: relative;
  width: 88px;
  display: flex;
  flex-direction: column;
  cursor: pointer;

  &__circle{
    background-color: #9F885C;
    border-radius: 50%;
    border: 3px solid #2E1E0E;
    display: flex;
    width: 55px;
    position: relative;
    height: 55px;
    box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
    margin-left: auto;
    margin-right: auto;
    background-image: v-bind(avatarUrl);
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;

    &__plus{
      width: 20px;
      height: 20px;
      color: #2E1E0E;
      margin: auto;
    }

    &__host{
      width: 14px;
      height: 14px;
      color: #F5D8B6;
      margin-left: auto;
      margin-top: auto;
      position: absolute;
    }
  }

  &__plate{
    width: 100%;
    height: 24px;
    background-color: #321D02;
    border-radius: 5px;
    border: 3px solid #E5CC9F;
    box-shadow: 0 0 0 2px #321D02;
    margin-top: -5px;
    color: #F5D8B6;
    font-weight: 500;
    font-size: 14px;
    line-height: 14px;
    text-align: center;
    padding: 2px;
    position: relative;
  }

  &__self{
    position: absolute;
    top: -8px;
    font-size: 10px;
    width: 100%;
    text-align: center;
    background-color: rgba(0, 0, 0, .5);
    border-radius: 100px;
    z-index: 2;
  }

  &__position{
    position: absolute;
    right: -8px;
    bottom: 0;
    z-index: 2;
    border-radius: 100%;
    width: 16px;
    height: 16px;
    background-color: #2E1E0E;
    font-size: 12px;
    line-height: 12px;
    font-weight: 500;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.player-name{
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.absolute-marquee-text{
  text-align: center;
  display: inline-block;
  position: absolute;
  left: 0;
  width: 100%;
  height: 100%;
  &.scroll{
    -webkit-animation: scroll 12s infinite linear;
    -moz-animation: scroll 12s infinite linear;
    animation: scroll 12s infinite linear;
  }
}

@-webkit-keyframes scroll {
  0% {transform: translateX(0%);}
  40% {transform: translateX(var(--marquee-width));}
  52% {transform: translateX(var(--marquee-width));}
  90% {transform: translateX(0%);}
  100% {transform: translateX(0%);}
}

@-moz-keyframes scroll {
  0% {transform: translateX(0%);}
  40% {transform: translateX(var(--marquee-width));}
  52% {transform: translateX(var(--marquee-width));}
  90% {transform: translateX(0%);}
  100% {transform: translateX(0%);}
}

@keyframes scroll {
  0% {transform: translateX(0%);}
  40% {transform: translateX(var(--marquee-width));}
  52% {transform: translateX(var(--marquee-width));}
  90% {transform: translateX(0%);}
  100% {transform: translateX(0%);}
}

</style>