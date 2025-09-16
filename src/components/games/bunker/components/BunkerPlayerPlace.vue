<template>
  <div class="place" @click.prevent="handleClick" :class="{'speaker': isSpeaker}">
    <div class="place__self" v-if="isSelf">
      Это Вы
    </div>
    <UiIcon v-if="isHost" name="sunglasses" class="place__circle__host" />
    <div
        class="place__circle"
        :style="{'--avatar': (!disabled && player?.avatar) ? player?.avatar : undefined}"
        :class="{
          'no-active': player?.isEliminated || (player?.id && !player?.isConnected),
        }"
    >
      <UiIcon class="place__circle__plus" name="lock" v-if="disabled" />
      <UiIcon v-if="!disabled && !player" name="icon-plus" class="place__circle__plus" />
      <UiIcon v-if="!player?.isConnected && !!player?.id" name="wifi-off" class="place__circle__plus place__circle__disconnected" />
      <UiIcon v-if="player?.isEliminated" name="eliminated" class="place__circle__plus place__circle__eliminated" />
      <div class="place__position">{{ +place+1 }}</div>
    </div>
    <div class="place__plate">
      <div class="player-name">
        <div class="absolute-marquee-text" v-if="player && !disabled" v-marquee="'scroll'">
          {{ player?.name }}
        </div>
      </div>
    </div>
    <div class="place__action" v-if="roomStatus == 'waiting' || roomStatus == 'starting'" :class="{ready: player?.isReady}"></div>
    <transition name="opacity">
      <div class="place__microphone" v-if="isSpeaker || volume > 0.01">
        <microphone-icon color="#939393" volume-color="#7eba70" :place="place" :volume="volume" />
      </div>
    </transition>
    <div class="place__vote" v-if="canVote && !isVoted && gameStage == 'voting' && !player?.isEliminated && !!player?.id && !isSelf">
      <BunkerButton class="small" :class="{'is-self': isSelf}" @click.prevent.stop="$emit('vote')">
        Голосовать
      </BunkerButton>
    </div>
    <div class="place__vote" v-if="canVote && !isVoted && gameStage == 'voting' && !player?.isEliminated && !!player?.id && isSelf && !!canAbstainThisRound">
      <BunkerButton class="small" :class="{'is-self': isSelf}" @click.prevent.stop="$emit('vote')">
        Воздержаться
      </BunkerButton>
    </div>

    <div class="place__vote__results" v-if="gameStage == 'voting' && (isVoted || !!eliminated) && voteResults && player?.id">
      <div class="result-item" v-for="result in voteResults" :key="`player-${player?.id}-results`">
        {{ result }}
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {computed} from "vue";
import UiIcon from "@/components/common/icons/UiIcon.vue";
import {vMarquee} from "@/classes/directives/marquee.ts";
import type {TGameStage, TPlayer, TRoomStatus} from "@/components/games/bunker/types.ts";
import BunkerButton from "@/components/games/bunker/components/BunkerButton.vue";
import MicrophoneIcon from "@/components/common/icons/MicrophoneIcon.vue";

const props = defineProps<{
  place: number | string,
  playerId: number,
  player?: TPlayer,
  isHost?: boolean,
  isSpeaker?: boolean,
  isSelf?: boolean,
  disabled?: boolean,
  roomStatus?: TRoomStatus,
  gameStage?: TGameStage,
  canAbstainThisRound?: boolean,
  isVoted?: boolean,
  voteResults?: string[],
  canVote?: boolean,
  eliminated?: boolean,
  volume: number
}>();

const emit = defineEmits(['touch-player', 'touch-place', 'vote']);

const avatarUrl = computed(() => {
  if(props.player?.avatar){
    return `url(${props.player?.avatar})`;
  }
  return 'none';
});

const handleClick = () => {
  if(props.disabled){
    return;
  }
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
  transition: left .3s ease-out, right .3s ease-out;

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

    &.no-active{
      &:after{
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, .3);
        border-radius: 50%;
      }
    }

    &__plus{
      width: 20px;
      height: 20px;
      color: #2E1E0E;
      margin: auto;
    }

    &__eliminated{
      width: 35px;
      height: 35px;
      position: absolute;
      left: 7px;
      top: 7px;
    }

    &__disconnected{
      position: absolute;
      z-index: 2;
      color: #E5CC9F;
      top: 15px;
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

  &__action{
    position: absolute;
    top: 20px;

    &.ready{
      width: 20px;
      height: 20px;
      border-radius: 100%;
      background-image: url('/assets/img/white-check.svg');
      background-size: 10px 10px;
      background-repeat: no-repeat;
      background-position: center;
      background-color: #7eba70;
    }
  }

  &__microphone{
    position: absolute;
    top: 20px;

    svg{
      width: 20px;
      height: 20px;
    }
  }

  &__vote{
    position: absolute;
    top: 20px;
    .game-btn{
      background-color: #95501B;

      &.is-self{
        background-color: #334240;
      }
    }

    &__results{
      position: absolute;
      top: 10px;
      display: flex;
      gap: 2px 4px;
      flex-wrap: wrap;
      width: 50px;

      .result-item{
        font-size: 12px;
        width: 14px;
        height: 14px;
        border-radius: 100%;
        background-color: #95501B;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #E5CC9F;
        font-weight: 600;
        box-shadow: 0 0 10px rgba(0, 0, 0, .3);
      }
    }
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