<template>
  <div class="bunker">
    <div class="bunker__places">
      <template
          v-for="(playerId, place) in places"
          :key="`place-${place}-player-${playerId}`"
      >
        <BunkerPlayerPlace
            :place="place"
            :player-id="playerId"
            :player="players?.get?.(playerId.toString())"
            :is-host="hostId == playerId"
            :is-self="playerId == id"
            :disconnected="false"
            :eliminated="false"
            :is-speaker="false"
            @touch-place="onTouchPlace(place)"
            @touch-player="onTouchPlayer(playerId.toString())"
        />
      </template>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {getStateCallbacks, type Room} from "colyseus.js";
import {inject, onBeforeUnmount, onMounted, ref, shallowRef} from "vue";
import type {TGameStage, TRoomStatus} from "@/components/games/bunker/types.ts";
import type {BunkerGameRoomState} from "@/components/games/bunker/schemas/schemas/BunkerGameRoomState.ts";
import {MapSchema} from "@colyseus/schema";
import {Player} from "@/components/games/bunker/schemas/schemas/Player.ts";
import BunkerPlayerPlace from "@/components/games/bunker/BunkerPlayerPlace.vue";
import {storeToRefs} from "pinia";
import {ecosystemStore} from "@/stores/Ecosystem/ecosystemStore.ts";
import {NotificationsSymbol} from "@/modules/NotificationsModule/symbols.ts";
import type {INotificationsProvider} from "@/modules/NotificationsModule/Interfaces/INotificationsProvider.ts";
import {useAnimatedRouter} from "@/classes/utils/useAnimatedRouter.ts";

const props = defineProps<{
  room: Room
}>();

const notificationsProvider: INotificationsProvider | undefined = inject(NotificationsSymbol);
const {id} = storeToRefs(ecosystemStore());


const currentRound = ref<number>();
const currentSpeakerId = ref<number | string>();
const activeCardTypes = ref<string[]>();
const disconnectedPlayers = ref<string[] | number[]>();
const eliminatedPlayers = ref<string[] | number[]>();
const gameStage = ref<TGameStage>();
const hostId = ref<number>();
const isPrivateRoom = ref<boolean>();
const minPlayers = ref<number>();
const maxPlayers = ref<number>();
const playersCount = ref<number>();
const maxRounds = ref<number>();
const status = ref<TRoomStatus>();
const turnTimeLimit = ref<number>();
const turnTimeRemaining = ref<number>();

const places = ref<{[key:string]: number}>();
const players = ref<BunkerGameRoomState['players']>();
const scenario = ref();
const votingResults = ref();
const router = useAnimatedRouter();

const unbindCallbacks: any[] = [];

const initializeGame = () => {
  const roomState = props.room.state as BunkerGameRoomState;
  const $ = getStateCallbacks(props.room);

  unbindCallbacks.push($(props.room.state).listen("currentRound", (currentValue, previousValue) => {
    currentRound.value = currentValue;
  }));
  unbindCallbacks.push($(props.room.state).listen("currentSpeakerId", (currentValue, previousValue) => {
    currentSpeakerId.value = currentValue;
  }));
  unbindCallbacks.push($(props.room.state).listen("gameStage", (currentValue, previousValue) => {
    gameStage.value = currentValue;
  }));
  unbindCallbacks.push($(props.room.state).listen("hostId", (currentValue, previousValue) => {
    hostId.value = currentValue;
  }));
  unbindCallbacks.push($(props.room.state).listen("isPrivateRoom", (currentValue, previousValue) => {
    isPrivateRoom.value = currentValue;
  }));
  unbindCallbacks.push($(props.room.state).listen("minPlayers", (currentValue, previousValue) => {
    minPlayers.value = currentValue;
  }));
  unbindCallbacks.push($(props.room.state).listen("maxPlayers", (currentValue, previousValue) => {
    maxPlayers.value = currentValue;
  }));
  unbindCallbacks.push($(props.room.state).listen("playersCount", (currentValue, previousValue) => {
    playersCount.value = currentValue;
  }));
  unbindCallbacks.push($(props.room.state).listen("maxRounds", (currentValue, previousValue) => {
    maxRounds.value = currentValue;
  }));
  unbindCallbacks.push($(props.room.state).listen("status", (currentValue, previousValue) => {
    status.value = currentValue;
  }));
  unbindCallbacks.push($(props.room.state).listen("turnTimeLimit", (currentValue, previousValue) => {
    turnTimeLimit.value = currentValue;
  }));
  unbindCallbacks.push($(props.room.state).listen("turnTimeRemaining", (currentValue, previousValue) => {
    turnTimeRemaining.value = currentValue;
  }));

  unbindCallbacks.push($(props.room.state).places.onAdd((playerId, placeIndex) => {
    places.value![placeIndex] = playerId;
    console.log('>>> PLACES ON ADD: placeIndex:', placeIndex, 'id: ', playerId);
  }));
  unbindCallbacks.push($(props.room.state).places.onChange((playerId:any, placeIndex:any) => {
    places.value![placeIndex] = playerId;
  }));
  unbindCallbacks.push($(props.room.state).places.onRemove((playerId, placeIndex) => {
    if(placeIndex in (places.value || {})){
      console.log('>>> PLACES ON REMOVE: placeIndex:', placeIndex, 'id: ', playerId);
      delete places.value?.[placeIndex];
    }
  }));

  unbindCallbacks.push($(props.room.state).players.onAdd((playerData, playerId) => {
    console.log('>>> PLAYERS ON ADD', playerId, playerData);
    players.value?.set(playerId, playerData);
  }))
  unbindCallbacks.push($(props.room.state).players.onRemove((playerData, playerId) => {
    console.log('>>> PLAYERS ON REMOVE', playerId, playerData);
    if(players.value?.has(playerId)){
      players.value?.delete(playerId);
    }
  }))


  // players.value = roomState.players;
  // scenario.value = roomState.scenario;
  // votingResults.value = roomState.votingResults;
  // disconnectedPlayers.value = roomState.disconnectedPlayers || [];
  // activeCardTypes.value = roomState.activeCardTypes;
  // eliminatedPlayers.value = roomState.eliminatedPlayers || [];


  props.room?.onMessage?.('error', (message: string) => {
    notificationsProvider?.addNotification({
      type: "warning",
      message: message,
    });
  });

  props.room?.onMessage?.('playerConnected', (message: any) => {
    console.log('>>> PLAYER CONNECTED', message); //todo: отображать игрокам сообщение о том, что игрок присоединился
  });
  props.room?.onMessage?.('playerJoined', (message: any) => {
    console.log('>>> PLAYER JOINED', message); //todo: отображать игрокам сообщение о том, что игрок присоединился
  });
  props.room?.onMessage?.('__playground_message_types', (message: any) => {
    console.log('>>> __playground_message_types', message); //todo: убрать обработчик
  });
  props.room?.onMessage?.('playerKicked', (message: any) => {
    console.log('>>> playerKicked', message);
  });
  props.room?.onMessage?.('kickSuccess', (message: any) => {
    console.log('>>> kickSuccess', message);
  });
  props.room?.onMessage?.('kicked', (message: any) => {
    notificationsProvider?.addPopup('you-are-kocked', 'simple-popup', {
      message: message,
      modal: true,
      middle: true,
      noTitle: true,
      darkBg: true,
    })
    router.replace('/');
  });
  props.room?.onMessage?.('leaderChanged', (message: any) => {
    console.log('>>> leaderChanged', message);
  });
  props.room?.onMessage?.('setLeaderSuccess', (message: any) => {
    console.log('>>> setLeaderSuccess', message);
  });

}


const requestChangePlace = (place: number | string) => {
  props.room?.send('changePlace', +place.toString());
}

const requestKickPlayer = (playerId: string) => {
  props.room?.send('kickPlayer', playerId);
}

const requestSetLeader = (playerId: string) => {
  props.room?.send('setLeaderPlayer', playerId);
}


const onTouchPlace = (place: string | number) => {
  if(status.value == 'waiting'){
    notificationsProvider?.addPopup('game-bunker-touch-place-'+place+'-popup', 'game-bunker-touch-place-popup', {
      modal: true,
      middle: true,
      noTitle: true,
      noPaddings: true,
      darkBg: true,
      placeNumber: (+place+1),
      inviteFriendCallback: () => {}, //todo: пригласить друзей в игровую комнату
      changePlaceCallback: () => {requestChangePlace(place)}
    });
  }
}

const onTouchPlayer = (playerId: string) => {
  const player = players.value?.get(playerId);
  if(!player){
    return;
  }

  notificationsProvider?.addPopup('game-bunker-touch-player-'+playerId+'-popup', 'game-bunker-touch-player-popup', {
    modal: true,
    middle: true,
    noTitle: true,
    noPaddings: true,
    noBackground: true,
    darkBg: true,
    noCloseButton: true,
    backdropBlur: true,
    player: player,
    isHost: hostId.value == id.value && status.value === 'waiting',
    kickCallback: () => {requestKickPlayer(playerId)},
    setLeaderCallback: () => {requestSetLeader(playerId)},
  });

}

onMounted(() => {
  places.value = {
    "0": 0,
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 0,
    "6": 0,
    "7": 0,
  };

  players.value = new MapSchema<Player>();
  initializeGame();
});

onBeforeUnmount(() => {
  for(let i = 0; i < unbindCallbacks.length; i++){
    unbindCallbacks?.[i]?.();
  }
  props.room.removeAllListeners();
  props.room.leave();
})

</script>
<style lang="scss" scoped>
.bunker{
  height: 100%;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background-image: url("/assets/img/games/bunker/bunker-bg.png");
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  padding-top: 15px;
  padding-top: calc(env(safe-area-inset-top,0) + 15px);
  padding-left: 15px;
  padding-right: 15px;
  padding-bottom: 40px;

  &__places{
    display: grid;
    position: relative;
    width: 100%;
    grid-template-columns: auto auto;
    gap: 20px 10px;
    justify-content: space-between;
    top: calc(50% - 40px);
    transform: translateY(-50%);
  }

}
</style>