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
          :volume="volumes?.[playerId.toString()] || 0"
          :player="players?.[playerId.toString()]"
          :is-host="hostId == playerId"
          :is-self="playerId == id"
          :disabled="(+place) > ((playersCount || 8)-1)"
          :is-speaker="speakerId == playerId && playerId != 0"
          :room-status="status"
          :game-stage="stage"
          :is-voted="isVoted"
          :vote-results="voteResults?.[(+playerId).toString()] || []"
          :can-abstain-this-round="canAbstainThisRound"
          :can-vote="!!canVote"
          :eliminated="eliminated"
          :spectator-mode="spectatorMode"
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
  isVoted?: boolean,
  voteResults?: {[p: string]: string[]},
  canVote?: boolean,
  eliminated?: boolean,
  volumes?: {[p: string]: number},
  spectatorMode?: boolean,
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

  &.speaker{
    .place__circle{
      border-color: #48a002;
      border-width: 4px;
    }
  }

  &:nth-child(odd){
    left: 0;
    &.speaker{
      left: 20px;
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

      &__results{
        left: 90px;
      }
    }

  }
  &:nth-child(even){
    margin-left: auto;
    right: 0;
    &.speaker{
      right: 20px;
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
      &__results{
        right: 90px;
        flex-direction: row-reverse;
      }
    }
  }

}

@media(min-height: 600px){
  .places{
    gap: 20px 10px;
  }
}
</style>