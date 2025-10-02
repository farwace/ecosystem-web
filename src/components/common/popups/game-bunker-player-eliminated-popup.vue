<template>
  <div class="eliminated">
    <div class="eliminated__picture">
      <img :src="pictureSrc" alt="Результат голосования">
    </div>
    <div class="eliminated__text" :class="{'eliminated': !!eliminated}">
      <div class="eliminated-button">
        <div class="btn" @click="$emit('close')">
          Продолжить
        </div>
      </div>
      <template v-if="eliminated">
        Игрок {{ CutString(player?.name || '', 15) }}<br/>{{ !!player?.isMale ? ' был изгнан ' : ' была изгнана '}} {{ eliminateReason }}
      </template>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type {TPlayer} from "@/components/games/bunker/types.ts";
import {computed} from "vue";
import {CutString} from "@/classes/utils/CutString.ts";

const props = defineProps<{
  player?: TPlayer,
  eliminated?: boolean,
  eliminateType?: string,
}>();

const emits = defineEmits(['close']);

const pictureSrc = computed(() => {
  const male = !!props.player?.isMale;
  const eliminated = props.eliminated;

  if(!eliminated){
    return '/assets/img/games/bunker/nobody-eliminated.png';
  }
  else{
    if(male){
      return '/assets/img/games/bunker/male-eliminated.png';
    }
    else{
      return '/assets/img/games/bunker/female-eliminated.png';
    }
  }
})

const eliminateReason = computed(() => {
  let reason = 'по результатам голосования...';
  if(props.eliminateType == 'random'){
    reason = 'случайным образом...'
  }
  if(props.eliminateType == 'controversialVoting'){
    reason = 'из-за неопределенности игроков...'
  }
  return reason;
})

</script>
<style lang="scss" scoped>
.eliminated{
  display: flex;
  flex-direction: column;

  &__picture{
    margin-left: auto;
    margin-right: auto;
    max-width: 280px;
  }

  &__text{
    max-width: 280px;
    margin-left: auto;
    margin-right: auto;
    text-align: center;
    position: relative;
    color: #8D593B;
    font-size: 18px;
    line-height: 20px;
    font-weight: bold;

    &.eliminated{
      background-color: #FFEFCC;
      border-radius: 12px;
      margin-top: 5px;
      padding: 20px 10px 10px;

      .eliminated-button{
        position: absolute;
        margin-top: -50px;
        width: calc(100% - 20px);
      }
    }
  }

  .eliminated-button{
    z-index: 2;
    display: flex;
    justify-content: center;


    .btn{
      border-radius: 100px;
      font-size: 16px;
      font-weight: bold;
      color: #FFDC79;
      background-color: #E68500;
      border: 3px solid #5C3000;
      padding: 10px 20px;
      line-height: 16px;
      cursor: pointer;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
      transition: background-color .3s ease-out, box-shadow .3s ease-out, color .3s ease-out;

      &:hover{
        background-color: #FFDC79;
        color: #E68500;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
      }
    }
  }
}
</style>