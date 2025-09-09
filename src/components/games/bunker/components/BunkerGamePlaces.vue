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
          :disconnected="false"
          :eliminated="false"
          :is-speaker="false"
          :room-status="status"
          @touch-place="onTouchPlace(place)"
          @touch-player="onTouchPlayer(playerId.toString())"
      />
    </template>
  </div>
</template>
<script lang="ts" setup>
import BunkerPlayerPlace from "@/components/games/bunker/components/BunkerPlayerPlace.vue";
import {storeToRefs} from "pinia";
import {ecosystemStore} from "@/stores/Ecosystem/ecosystemStore.ts";
import type {TPlayer, TRoomStatus} from "@/components/games/bunker/types.ts";
const props = defineProps<{
  places?: {[key:string]: number},
  players?: Record<string, TPlayer>,
  hostId?: number,
  playersCount?: number,
  status?: TRoomStatus,
}>();

const {id} = storeToRefs(ecosystemStore());

const emits = defineEmits(['touchPlace', 'touchPlayer']);

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
  &:nth-child(odd){
    .place__action{
      right: -10px;
    }
  }
  &:nth-child(even){
    .place__action{
      left: -10px;
    }
  }

}

@media(min-height: 600px){
  .places{
    gap: 20px 10px;
  }
}
</style>