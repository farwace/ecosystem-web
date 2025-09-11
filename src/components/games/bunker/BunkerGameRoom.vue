<template>
  <div class="bunker" ref="bunkerContainer">
    <div class="bunker__settings">
      <BunkerSettingsBurger
          :host="hostId == id"
          :players-count="playersCount"
          @leave="onLeaveClick"
          @rules="onRulesClick"
          @settings="onSettingsClick"
          @minus="onPlayersMinusClick"
          @plus="onPlayersPlusClick"
      />
    </div>

    <div class="bunker__screen">
      <bunker-game-screen
          :max-height="freeAreaHeight"
          :text="topText.text"
          :size="topText.size"
          :scenario="scenario"
          :timer="turnTimeRemaining"
          :stage="gameStage"
          :room-status="status"
          :round="currentRound"
          @show-scenario="showScenarioModal()"
      />
    </div>

    <div class="bunker__places" ref="placesDiv">
      <bunker-game-places
          :places="places"
          :players-count="playersCount"
          :host-id="hostId"
          :players="players"
          :status="status"
          @touch-player="onTouchPlayer($event)"
          @touch-place="onTouchPlace($event)"
      />
    </div>

    <div class="bunker__controls"> <!-- todo: передавать вкл/выкл микрофон -->
      <bunker-lobby-buttons
          v-if="status == 'waiting' || status == 'starting'"
          :max-height="freeAreaHeight"
          :player="currentPlayer"
          @ready="requestReady($event)"
      />
      <bunker-user-cards
          v-if="status == 'playing'"
          :max-height="freeAreaHeight"
          :cards="currentPlayer.cards"
          :revealed-cards="currentPlayer.revealedCards"
          :is-speaker="currentSpeakerId == currentPlayer?.id"
      />
    </div>

    <div class="bunker__private" v-if="status == 'waiting'">
      <BunkerTogglePrivate :host="hostId == id" :value="isPrivateRoom" @click="togglePrivateRoom"/>
    </div>

  </div>
</template>
<script lang="ts" setup>
import {getStateCallbacks, type Room} from "colyseus.js";
import {computed, inject, nextTick, onBeforeUnmount, onMounted, reactive, ref, shallowRef} from "vue";
import type {TGameStage, TPlayer, TRoomStatus, TScenario} from "@/components/games/bunker/types.ts";
import type {BunkerGameRoomState} from "@/components/games/bunker/schemas/schemas/BunkerGameRoomState.ts";
import {Player} from "@/components/games/bunker/schemas/schemas/Player.ts";
import {storeToRefs} from "pinia";
import {ecosystemStore} from "@/stores/Ecosystem/ecosystemStore.ts";
import {NotificationsSymbol} from "@/modules/NotificationsModule/symbols.ts";
import type {INotificationsProvider} from "@/modules/NotificationsModule/Interfaces/INotificationsProvider.ts";
import {useAnimatedRouter} from "@/classes/utils/useAnimatedRouter.ts";
import BunkerSettingsBurger from "@/components/games/bunker/components/BunkerSettingsBurger.vue";
import BunkerTogglePrivate from "@/components/games/bunker/components/BunkerTogglePrivate.vue";
import BunkerGameScreen from "@/components/games/bunker/components/BunkerGameScreen.vue";
import BunkerGamePlaces from "@/components/games/bunker/components/BunkerGamePlaces.vue";
import BunkerLobbyButtons from "@/components/games/bunker/components/BunkerLobbyButtons.vue";
import {Console} from "@/classes/utils/Console.ts";
import BunkerUserCards from "@/components/games/bunker/components/BunkerUserCards.vue";

const props = defineProps<{
  room: Room
}>();

const notificationsProvider: INotificationsProvider | undefined = inject(NotificationsSymbol);
const {id} = storeToRefs(ecosystemStore());

const placesDiv = ref<HTMLDivElement>();
const bunkerContainer = ref<HTMLDivElement>();
const freeAreaHeight = ref<number>(0);

const currentRound = ref<number>();
const currentSpeakerId = ref<number | string>();
const gameStage = ref<TGameStage>();
const hostId = ref<number>();
const isPrivateRoom = ref<boolean>();
const minPlayers = ref<number>();
const maxPlayers = ref<number>();
const playersCount = ref<number>();
const status = ref<TRoomStatus>();
const turnTimeLimit = ref<number>();
const turnTimeRemaining = ref<number>();

const places = ref<{[key:string]: number}>();
const players = ref<Record<string, TPlayer>>({});
const scenario = ref<TScenario>();
const activeCardTypes = ref<string[]>();
const disconnectedPlayers = ref<string[] | number[]>();
const eliminatedPlayers = ref<string[] | number[]>();
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
  unbindCallbacks.push($(props.room.state).listen("status", (currentValue, previousValue) => {
    status.value = currentValue;
  }));
  unbindCallbacks.push($(props.room.state).listen("turnTimeLimit", (currentValue, previousValue) => {
    turnTimeLimit.value = currentValue;
  }));
  unbindCallbacks.push($(props.room.state).listen("turnTimeRemaining", (currentValue, previousValue) => {
    console.log('>>> currentTimeRemaining', currentValue, previousValue);
    turnTimeRemaining.value = currentValue;
  }));
  unbindCallbacks.push($(props.room.state).listen("scenario", (currentValue, previousValue) => {
    scenario.value = currentValue;
  }));


  unbindCallbacks.push($(props.room.state).places.onAdd((playerId, placeIndex) => {
    places.value![placeIndex] = playerId;
    Console.log('>>> PLACES ON ADD: placeIndex:', placeIndex, 'id: ', playerId);
  }));
  unbindCallbacks.push($(props.room.state).places.onChange((playerId:any, placeIndex:any) => {
    places.value![placeIndex] = playerId;
  }));
  unbindCallbacks.push($(props.room.state).places.onRemove((playerId, placeIndex) => {
    if(placeIndex in (places.value || {})){
      Console.log('>>> PLACES ON REMOVE: placeIndex:', placeIndex, 'id: ', playerId);
      delete places.value?.[placeIndex];
    }
  }));

  unbindCallbacks.push($(props.room.state).players.onAdd((playerData, playerId) => {
    Console.log('>>> PLAYERS ON ADD', playerId, playerData);
    players.value![playerId] = createPlayerObject(playerData);

    unbindCallbacks.push($(playerData).onChange(() => {
      Console.log('>>> PLAYER DATA ON CHANGE', playerId, playerData);
      players.value![playerId] = createPlayerObject(playerData);
    }))

  }))
  unbindCallbacks.push($(props.room.state).players.onRemove((playerData, playerId) => {
    Console.log('>>> PLAYERS ON REMOVE', playerId, playerData);
    if(players.value![playerId]){
      delete players.value[playerId];
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

  props.room?.onMessage?.('playerConnected', (player: Player) => {
    notificationsProvider?.addNotification({
      type: 'game-info',
      message: 'Игрок ' + (player?.name ? (player.name + ' ') : '') + ' присоединился к комнате'
    })
  });
  props.room?.onMessage?.('playerReconnected', (player: Player) => {
    notificationsProvider?.addNotification({
      type: 'game-info',
      message: 'Игрок ' + (player?.name ? (player.name + ' ') : '') + ' вернулся'
    })
  });
  props.room?.onMessage?.('playerLeft', (player: Player) => {
    notificationsProvider?.addNotification({
      type: 'game-info',
      message: 'Игрок ' + (player?.name ? (player.name + ' ') : '') + ' вышел из комнаты'
    })
  });
  props.room?.onMessage?.('gameInit', () => {
    if(scenario.value){
      showScenarioModal();
    }
  });


  props.room?.onMessage?.('__playground_message_types', (message: any) => {
    Console.log('>>> __playground_message_types', message); //todo: убрать обработчик
  });

  props.room?.onMessage?.('playerKicked', (player: Player) => {
    notificationsProvider?.addNotification({
      type: 'game-info',
      message: 'Игрок ' + (player?.name ? (player.name + ' ') : '') + ' исключен из комнаты'
    })
  });

  props.room?.onMessage?.('kicked', (message: any) => {
    notificationsProvider?.addPopup('you-are-kicked', 'simple-popup', {
      message: '<div style="margin-top: 35px; text-align: center">' + message + '</div>',
      modal: true,
      middle: true,
      noTitle: true,
      darkBg: true,
    })
    router.replace('/');
  });
  props.room?.onMessage?.('leaderChanged', (message: any) => {
    notificationsProvider?.addNotification({
      type: 'game-info',
      message: 'Назначен новый лидер комнаты',
    })
  });

}

const showScenarioModal = () => {
  setTimeout(() => {
    if(scenario.value?.id){
      notificationsProvider?.addPopup('game-scenario', 'game-bunker-scenario-popup', {
        noPaddings: true,
        noBackground: true,
        noTitle: true,
        darkBg: true,
        backdropBlur: true,
        scenario: scenario.value,
      });
    }
  }, 50)
}

const createPlayerObject = (playerData: Player): TPlayer => {
  return  {
    isReady: playerData.isReady,
    id: playerData.id,
    sessionId: playerData.sessionId,
    avatar: playerData.avatar,
    isVip: playerData.isVip,
    isMale: playerData.isMale,
    popularityLevel: playerData.popularityLevel,
    popularity: playerData.popularity,
    level: playerData.level,
    experience: playerData.experience,
    isPremium: playerData.isPremium,
    age: playerData.age,
    isConnected: playerData.isConnected,
    canSpeak: playerData.canSpeak,
    name: playerData.name,
    isEliminated: playerData.isEliminated,
    votesAgainst: playerData.votesAgainst,
    revealedCards: playerData.revealedCards,
    cards: playerData.cards,
  }
}

const currentPlayer = computed(() => {
  return players.value?.[id.value.toString()];
})

const topText = computed(() => {
  let data: {text?:string, size?:string} = {
    text: undefined,
    size: 'normal',
  }

  if(status.value == 'waiting'){
    let freePlaces = 0;
    Object.keys(places.value || {}).forEach((place) => {
      if(!places.value?.[place]){
        freePlaces++;
      }
    })

    const shouldFreePlaces = Object.keys(places.value || {}).length - (playersCount.value || 8)

    if(freePlaces > shouldFreePlaces){
      data.text = 'Ожидание игроков';
      return data;
    }
    if(!currentPlayer.value?.isReady){
      data.text = 'Нажмите готов';
      return data;
    }
    data.text = 'Ожидание, пока игроки нажмут готов';
    data.size = 'small';
    return data;
  }
  data.text = undefined;
  return data;
});

const requestChangePlace = (place: number | string) => {
  props.room?.send('changePlace', +place.toString());
}

const requestKickPlayer = (playerId: string) => {
  props.room?.send('kickPlayer', playerId);
}

const requestSetLeader = (playerId: string) => {
  props.room?.send('setLeaderPlayer', playerId);
}

const requestReady = (val: boolean) => {
  props.room?.send('ready', val);
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
  const player = players.value[playerId];
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


const onSettingsClick = () => {
  notificationsProvider?.addPopup('game-bunker-settings-popup', 'game-bunker-settings-popup', {
    modal: true,
    noTitle: true,
    darkBg: true,
    noBackground: true,
    noPaddings: true,
  });
}
const onLeave = () => {
  router.replace('/');
}
const onLeaveClick = () => {
  if(status.value == 'playing'){
    notificationsProvider?.addPopup('game-bunker-leave-popup', 'game-bunker-leave-popup', {
      modal: true,
      noTitle: true,
      middle: true,
      darkBg: true,
      noBackground: true,
      noPaddings: true,
      leaveCallback: () => {onLeave()},
    });
  }
  else{
    onLeave();
  }
}
const onRulesClick = () => {
  //todo: открывать попап с правилами игры
}


const togglePrivateRoom = () => {
  if(hostId.value == id.value){
    props.room?.send('togglePrivateRoom');
  }
}

const onPlayersMinusClick = () => {
  if(hostId.value == id.value){
    props.room?.send('changePlayersCount', 'sub');
  }
}
const onPlayersPlusClick = () => {
  if(hostId.value == id.value){
    props.room?.send('changePlayersCount', 'add');
  }
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
  players.value = {};
  initializeGame();


  nextTick(() => {
    if(placesDiv.value && bunkerContainer.value){
      const placesDivHeight = placesDiv.value.clientHeight;
      const parentStyles = getComputedStyle(bunkerContainer.value);
      const paddingTop = parseFloat((parentStyles.paddingTop || '0').replace('px', ''));
      const paddingBottom = parseFloat((parentStyles.paddingBottom || '0').replace('px', ''));
      const containerHeight = bunkerContainer.value.clientHeight - paddingTop - paddingBottom;
      freeAreaHeight.value = Math.max((containerHeight - placesDivHeight) / 2, 0);
    }
  })

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

  &__screen{
    position: absolute;
    width: 100%;
    left: 0;
    display: flex;
    flex-direction: row;
  }

  &__controls{
    position: absolute;
    width: 100%;
    left: 0;
    bottom: 40px;
    display: flex;
    flex-direction: row;
  }

  &__places{
    position: relative;
    width: 100%;
    //top: calc(50% - 40px);
    top: 50%;
    transform: translateY(-50%);
  }

  &__settings {
    position: absolute;
    top: 15px;
    top: calc(env(safe-area-inset-top,0) + 15px);
    left: 15px;
  }

  &__private{
    position: absolute;
    bottom: 40px;
    left: 15px;
  }
}

</style>