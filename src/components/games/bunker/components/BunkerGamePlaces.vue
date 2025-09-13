<template>
  <div class="places">
    <template
        v-if="places"
        v-for="(playerId, place) in places"
        :key="`place-${place}-player-${playerId}`"
    >
      <BunkerPlayerPlace
          :place="place"
          :player-id="playerId"
          :player="players?.[playerId.toString()]"
          :is-host="hostId == playerId"
          :is-self="playerId == id"
          :disabled="(+place) > ((playersCount || 8)-1)"
          :is-speaker="speakerId == playerId && playerId != 0"
          :room-status="status"
          :game-stage="stage"
          :can-abstain-this-round="canAbstainThisRound"
          @touch-place="onTouchPlace(place)"
          @touch-player="onTouchPlayer(playerId.toString())"
          @vote="$emit('vote', playerId == id ? 0 : playerId)"
      />
    </template>
  </div>
</template>
<script lang="ts" setup>
import BunkerPlayerPlace from "@/components/games/bunker/components/BunkerPlayerPlace.vue";
import {storeToRefs} from "pinia";
import {ecosystemStore} from "@/stores/Ecosystem/ecosystemStore.ts";
import type {TGameStage, TPlayer, TRoomStatus} from "@/components/games/bunker/types.ts";
const props = defineProps<{
  places?: {[key:string]: number},
  players?: Record<string, TPlayer>,
  hostId?: number,
  playersCount?: number,
  status?: TRoomStatus,
  speakerId?: number | string,
  stage?: TGameStage,
  canAbstainThisRound?: boolean,
}>();

const {id} = storeToRefs(ecosystemStore());

const emits = defineEmits(['touchPlace', 'touchPlayer', 'vote']);

const onTouchPlace = (place: number | string) => {
  emits('touchPlace', place);
}
const onTouchPlayer = (playerId: string) => {
  emits('touchPlayer', playerId);
}
</script>
<style lang="scss" scoped>
.places{
  display: grid;
  position: relative;
  width: 100%;
  grid-template-columns: auto auto;
  gap: 15px 10px;
  justify-content: space-between;
}

:deep(.place){
  .place__microphone{
    position: absolute;
    top: 20px;

    svg{
      width: 20px;
      height: 20px;
    }
  }

  .place__action{
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

  .place__vote{
    position: absolute;
    top: 20px;
    .game-btn{
      background-color: #95501B;
    }
  }

  &:nth-child(odd){
    left: 0;
    &.speaker{
      left: 15px;
    }
    .place__action{
      right: -10px;
    }
    .place__microphone{
      left: -5px;
    }
    .place__circle__disconnected{
      left: -25px;
    }
    .place__vote{
      right: -50px;
    }
  }
  &:nth-child(even){
    margin-left: auto;
    right: 0;
    &.speaker{
      right: 15px;
    }
    .place__action{
      left: -10px;
    }
    .place__microphone{
      right: -5px;
    }
    .place__circle__disconnected{
      right: -25px;
    }
    .place__vote{
      left: -50px;
    }
  }

}

@media(min-height: 600px){
  .places{
    gap: 20px 10px;
  }
}
</style>