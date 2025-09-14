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
          :stage="gameStage"
          :can-abstain-this-round="canAbstainThisRound"
          :speaker-id="currentSpeakerId"
          :is-voted="isVoted"
          :vote-results="voteResults"
          @touch-player="onTouchPlayer($event)"
          @touch-place="onTouchPlace($event)"
          @vote="sendVote"
      />
      <div class="bunker__places__finish-speak" @click="sendFinishSpeak" v-if="currentSpeakerId == id && !((cardRevealTimeRemaining || 0) > 0)">
        <BunkerButton class="finish" @click="$emit('invite')">
          Договорил <UiIcon class="inline-icon microphone-off" name="microphone-off"/>
        </BunkerButton>
      </div>
      <div style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);" v-if="currentSpeakerId == id && (cardRevealTimeRemaining || 0) > 1 && (cardRevealTimeRemaining || 0) < 10">
        <vue3-lottie animationLink="/assets/lottie/send-card-help.json" :height="100" :width="100" :auto-play="true" :loop="true"/>
      </div>
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
          :cards="currentPlayer?.cards"
          :revealed-cards="currentPlayer.revealedCards"
          :is-male="currentPlayer?.isMale"
          :is-speaker="currentSpeakerId == currentPlayer?.id"
          :candSehd="canSendCard"
          :is-eliminated="currentPlayer?.isEliminated"
          @sendCard="onSendCard"
          ref="bunkerUserCardsComponentRef"
      />
    </div>

    <div class="bunker__private" v-if="status == 'waiting'">
      <BunkerTogglePrivate :host="hostId == id" :value="isPrivateRoom" @click="togglePrivateRoom"/>
    </div>

  </div>
</template>
<script lang="ts" setup>
import {getStateCallbacks, type Room} from "colyseus.js";
import {computed, inject, nextTick, onBeforeUnmount, onMounted, reactive, ref, shallowRef, watch} from "vue";
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
import {Card} from "@/components/games/bunker/schemas/schemas/Card.ts";
import {ArraySchema} from "@colyseus/schema";
import {CardCustomData} from "@/components/games/bunker/schemas/schemas/CardCustomData.ts";
import BunkerButton from "@/components/games/bunker/components/BunkerButton.vue";
import UiIcon from "@/components/common/icons/UiIcon.vue";
import {Vue3Lottie} from 'vue3-lottie';

const props = defineProps<{
  room: Room
}>();

const notificationsProvider: INotificationsProvider | undefined = inject(NotificationsSymbol);
const {id} = storeToRefs(ecosystemStore());

const placesDiv = ref<HTMLDivElement>();
const bunkerUserCardsComponentRef = ref<typeof BunkerUserCards>();
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
const cardRevealTimeRemaining = ref<number>();

const places = ref<{[key:string]: number}>();
const players = ref<Record<string, TPlayer>>({});
const scenario = ref<TScenario>();
const votingResults = ref();
const canAbstainThisRound = ref<boolean>(false);
const canSendCard = ref<boolean>(false);
const isVoted = ref<boolean>(false);
const voteResults = ref<{[key:string]: string[]}>();

const router = useAnimatedRouter();

const unbindCallbacks: any[] = [];

const initializeGame = () => {
  const roomState = props.room.state as BunkerGameRoomState;
  const $ = getStateCallbacks(props.room);

  unbindCallbacks.push($(props.room.state).listen("currentRound", (currentValue, previousValue) => {
    console.log('>>> CURRENT ROUND', currentValue, previousValue);
    voteResults.value = {};
    isVoted.value = false;
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
  unbindCallbacks.push($(props.room.state).listen("canAbstainThisRound", (currentValue, previousValue) => {
    canAbstainThisRound.value = currentValue;
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
  unbindCallbacks.push($(props.room.state).listen("cardRevealTimeRemaining", (currentValue, previousValue) => {
    console.log('>>> cardRevealTimeRemaining', currentValue, previousValue);
    cardRevealTimeRemaining.value = currentValue;
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

  unbindCallbacks.push($(props.room.state).currentVotes.onAdd((votesId, playerId) => {
    if(playerId == currentPlayer.value?.id){
      isVoted.value = true;
    }
    if(!voteResults.value?.[votesId]){
      voteResults.value![votesId] = [];
    }
    if(places.value){
      let placeNumber = 0;
      Object.keys(places.value).forEach((place) => {
        if(places.value?.[place] == playerId){
          placeNumber = +place+1;
        }
      })
      voteResults.value![votesId].push(placeNumber.toString());
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
    setTimeout(() => {
      if(scenario.value){
        showScenarioModal('-auto');
      }
    }, 150);

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

  props.room?.onMessage?.('playerTurnStarted', ( message: { playerId: string, timeRemaining: number, cardRevealTime: number } ) => {
    //todo: обработка события когда ход перешел к другому игроку
    Console.log('>>> PLAYER TURN STARTED', message);
    notificationsProvider?.removePopup?.('game-bunker-revealed-card-popup');
    notificationsProvider?.removePopup?.('game-scenario-auto');
  })

  props.room?.onMessage?.('cardRevealed', (message: { playerId: number,  card: {id: Card['id'], name: Card['name'], type: Card['type'], imageUrl: string, customData: CardCustomData}}) => {
    if(message.playerId == currentPlayer.value?.id){
      canSendCard.value = false;
      bunkerUserCardsComponentRef.value?.fForceDropCard?.(message.card.id);
    }
    const playerCard = new Card();
    playerCard.id = message.card.id;
    playerCard.name = message.card.name;
    playerCard.type = message.card.type;
    playerCard.maleImageUrl = message.card.imageUrl;
    playerCard.femaleImageUrl = message.card.imageUrl;
    playerCard.active = true;
    playerCard.isRevealed = true;
    const customData = new CardCustomData();
    customData.from = message.card.customData?.from;
    customData.to = message.card.customData?.to;
    customData.value = message.card.customData?.value;
    playerCard.customData = customData;
    playerCard.value = message.card.customData?.value || 0;
    showRevealedCardPopup(message.playerId, playerCard);
    Console.log('>>> CARD REVEALED', message);
  });

  props.room?.onMessage?.('votingStarted', (message: any) => {
    //todo: начало голосования
    Console.log('>>> VOTING STARTED', message);
    notificationsProvider?.removePopup?.('game-bunker-revealed-card-popup');
  });

  props.room?.onMessage?.('votingResults', (message: {votes: any, eliminatedPlayerId: any, round: any}) => {
    //todo: отображение, что игрок не попал в бункер если действительно есть тот, кого выкинули
    Console.log('>>> VOTING RESULTS', message);
  });

  props.room?.onMessage?.('gameFinished', (message: any) => {
    //todo: отображение модального окна с результатами и предложением выложить историю или просмотреть рекламу за двойную награду
    Console.log('>>> GAME FINISHED', message);
  });

}

const testAction = () => {
  const userCard = currentPlayer.value?.cards[1];
  if(userCard){
    const testCard: {id: Card['id'], name: Card['name'], type: Card['type'], imageUrl: string, customData: CardCustomData} = {
      id: userCard.id,
      name: userCard.name,
      type: userCard.type,
      imageUrl: userCard.maleImageUrl,
      customData: userCard.customData,
    }
    const customData = new CardCustomData();
    customData.from = userCard.customData?.from;
    customData.to = userCard.customData?.to;
    customData.value = userCard.customData?.value;

    const sendTestCard: Card = new Card();
    sendTestCard.id = testCard.id;
    sendTestCard.name = testCard.name;
    sendTestCard.type = testCard.type;
    sendTestCard.maleImageUrl = testCard.imageUrl;
    sendTestCard.femaleImageUrl = testCard.imageUrl;
    sendTestCard.customData = customData;
    sendTestCard.value = customData?.value || 0;
    const playerId = 2;

    showRevealedCardPopup(playerId, sendTestCard);
  }
}

const showRevealedCardPopup = (playerId: number, card: Card) => {
  const player = players.value?.[playerId.toString()];
  if(player?.id){
    notificationsProvider?.addPopup('game-bunker-revealed-card-popup', 'game-bunker-revealed-card-popup', {
      modal: true,
      small: true,
      noTitle: true,
      noBackground: true,
      noPaddings: true,
      noScroll: true,
      class: 'game-bunker',
      player: player,
      card: card,
      maxHeight: 200
    })
  }
}

const showScenarioModal = (postfix: string = '') => {
  setTimeout(() => {
    if(scenario.value?.id){
      notificationsProvider?.addPopup(('game-scenario' + postfix), 'game-bunker-scenario-popup', {
        noPaddings: true,
        noBackground: true,
        noTitle: true,
        darkBg: true,
        backdropBlur: true,
        class: 'game-bunker',
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

const onSendCard = (cardId: number | string) => {
  props.room?.send('revealCard', (+cardId).toString());
}

const sendVote = (playerId: number | string) => {
  props.room?.send('vote', (+playerId).toString());
}
const sendFinishSpeak = () => {
  props.room?.send('finishSpeaking');
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
      class: 'game-bunker',
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
    class: 'game-bunker',
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
    class: 'game-bunker',
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
      class: 'game-bunker',
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

const setGameStubs = () => {
  currentSpeakerId.value = 0;
  currentRound.value = 0;
  gameStage.value = 'voting';
  isVoted.value = true;
  voteResults.value = {
    10: ['8', '7', '6', '5', '4', '3', '1'],
    2: ['8', '7', '6', '5', '4', '3', '1'],
  };
  hostId.value = 1;
  isPrivateRoom.value = false;
  maxPlayers.value = 8;
  minPlayers.value = 4;
  /*@ts-ignore*/
  players.value = {"1":{"isReady":true,"id":1,"sessionId":"7OYvmCP7E","avatar":"https://sun70-1.userapi.com/s/v1/ig2/Mnbl4RlowjH_RK3F4WtScE7ZDNV1bEffN0zmkmJMPRlcSU1aSqCExpd3DgQ8pKFC1Lat8JMNx74crBuhsdZiCV7A.jpg?quality=95&crop=67,1,760,760&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720&ava=1&u=xcC0HAjSZgUX3g2E42IUjU3tG-JqrJWCoUrkvX060A8&cs=100x100","isVip":false,"isMale":true,"popularityLevel":0,"popularity":41,"level":3,"experience":50,"isPremium":false,"isConnected":true,"canSpeak":true,"name":"ВиталийСонДайсон","isEliminated":false,"votesAgainst":0,"revealedCards":{"items":[],"tmpItems":[],"deletedIndexes":{},"isMovingItems":false},"cards":{"items":[{"id":"63","name":"Видеоблогер","type":"profession","value":0,"active":true,"maleImageUrl":"https://s3.lapa-play.ru/assets/bunker/cards/videobloger-malcik-1-1-zuDq.png","femaleImageUrl":"https://s3.lapa-play.ru/assets/bunker/cards/videobloger-OofZ.png","customData":{"from":undefined,"to":undefined,"value":undefined},"isRevealed":false},{"id":"3","name":"Взрослый","type":"age","value":10,"active":true,"maleImageUrl":"https://s3.lapa-play.ru/assets/bunker/cards/muzcina-2-Dmzb.png","femaleImageUrl":"https://s3.lapa-play.ru/assets/bunker/cards/zenshhina-2-1-wmJA.png","customData":{"from":31,"to":59,"value":37},"isRevealed":false},{"id":"149","name":"Хронический гастрит","value":0,"type":"health","active":true,"maleImageUrl":"https://s3.lapa-play.ru/assets/bunker/cards/xroniceskii-gastrit-uC2w.png","femaleImageUrl":"https://s3.lapa-play.ru/assets/bunker/cards/xroniceskii-gastrit-tH5O.png","customData":{"from":undefined,"to":undefined,"value":undefined},"isRevealed":false},{"id":"187","name":"Эгоист","type":"characteristic","active":true,"maleImageUrl":"https://s3.lapa-play.ru/assets/bunker/cards/egoist-LxMu.png","femaleImageUrl":"https://s3.lapa-play.ru/assets/bunker/cards/egoistka-1-OI46.png","customData":{"from":undefined,"to":undefined,"value":undefined},"isRevealed":false},{"id":"225","name":"Бывший военный разведчик","type":"additional_information","active":true,"maleImageUrl":"https://s3.lapa-play.ru/assets/bunker/cards/byvsii-voennyi-razvedcik-2-qdcZ.png","femaleImageUrl":"https://s3.lapa-play.ru/assets/bunker/cards/byvsaia-voennaia-razvedcica-8zdf.png","customData":{"from":undefined,"to":undefined,"value":undefined},"isRevealed":false},{"id":"259","name":"Страх пыли","type":"phobias","active":true,"maleImageUrl":"https://s3.lapa-play.ru/assets/bunker/cards/strax-pyli-2-l0zY.png","femaleImageUrl":"https://s3.lapa-play.ru/assets/bunker/cards/strax-pyli-2-LcN8.png","customData":{"from":undefined,"to":undefined,"value":undefined},"isRevealed":false},{"id":"361","name":"Организация пространства в помещении","type":"skills","active":true,"maleImageUrl":"https://s3.lapa-play.ru/assets/bunker/cards/organizaciia-prostranstva-v-pomeshhenii-2-mQLi.png","femaleImageUrl":"https://s3.lapa-play.ru/assets/bunker/cards/organizaciia-prostranstva-v-pomeshhenii-2-xN8l.png","customData":{"from":undefined,"to":undefined,"value":undefined},"isRevealed":false},{"id":"462","name":"Кувалда","type":"luggage","active":true,"maleImageUrl":"https://s3.lapa-play.ru/assets/bunker/cards/kuvalda-2-Ybh1.png","femaleImageUrl":"https://s3.lapa-play.ru/assets/bunker/cards/kuvalda-2-6FRX.png","customData":{"from":undefined,"to":undefined,"value":undefined},"isRevealed":false}],"tmpItems":[{"id":"63","name":"Видеоблогер","type":"profession","active":true,"maleImageUrl":"https://s3.lapa-play.ru/assets/bunker/cards/videobloger-malcik-1-1-zuDq.png","femaleImageUrl":"https://s3.lapa-play.ru/assets/bunker/cards/videobloger-OofZ.png","customData":{"from":undefined,"to":undefined,"value":undefined},"isRevealed":false},{"id":"3","name":"Взрослый","type":"age","active":true,"maleImageUrl":"https://s3.lapa-play.ru/assets/bunker/cards/muzcina-2-Dmzb.png","femaleImageUrl":"https://s3.lapa-play.ru/assets/bunker/cards/zenshhina-2-1-wmJA.png","customData":{"from":31,"to":59,"value":37},"isRevealed":false},{"id":"149","name":"Хронический гастрит","type":"health","active":true,"maleImageUrl":"https://s3.lapa-play.ru/assets/bunker/cards/xroniceskii-gastrit-uC2w.png","femaleImageUrl":"https://s3.lapa-play.ru/assets/bunker/cards/xroniceskii-gastrit-tH5O.png","customData":{"from":undefined,"to":undefined,"value":undefined},"isRevealed":false},{"id":"187","name":"Эгоист","type":"characteristic","active":true,"maleImageUrl":"https://s3.lapa-play.ru/assets/bunker/cards/egoist-LxMu.png","femaleImageUrl":"https://s3.lapa-play.ru/assets/bunker/cards/egoistka-1-OI46.png","customData":{"from":undefined,"to":undefined,"value":undefined},"isRevealed":false},{"id":"225","name":"Бывший военный разведчик","type":"additional_information","active":true,"maleImageUrl":"https://s3.lapa-play.ru/assets/bunker/cards/byvsii-voennyi-razvedcik-2-qdcZ.png","femaleImageUrl":"https://s3.lapa-play.ru/assets/bunker/cards/byvsaia-voennaia-razvedcica-8zdf.png","customData":{"from":undefined,"to":undefined,"value":undefined},"isRevealed":false},{"id":"259","name":"Страх пыли","type":"phobias","active":true,"maleImageUrl":"https://s3.lapa-play.ru/assets/bunker/cards/strax-pyli-2-l0zY.png","femaleImageUrl":"https://s3.lapa-play.ru/assets/bunker/cards/strax-pyli-2-LcN8.png","customData":{"from":undefined,"to":undefined,"value":undefined},"isRevealed":false},{"id":"361","name":"Организация пространства в помещении","type":"skills","active":true,"maleImageUrl":"https://s3.lapa-play.ru/assets/bunker/cards/organizaciia-prostranstva-v-pomeshhenii-2-mQLi.png","femaleImageUrl":"https://s3.lapa-play.ru/assets/bunker/cards/organizaciia-prostranstva-v-pomeshhenii-2-xN8l.png","customData":{"from":undefined,"to":undefined,"value":undefined},"isRevealed":false},{"id":"462","name":"Кувалда","type":"luggage","active":true,"maleImageUrl":"https://s3.lapa-play.ru/assets/bunker/cards/kuvalda-2-Ybh1.png","femaleImageUrl":"https://s3.lapa-play.ru/assets/bunker/cards/kuvalda-2-6FRX.png","customData":{"from":undefined,"to":undefined,"value":undefined},"isRevealed":false}],"deletedIndexes":{},"isMovingItems":false}},"2":{"isReady":true,"id":2,"sessionId":"_dfJ_L5_F","avatar":"https://sun9-76.userapi.com/s/v1/ig2/uaez4Wl7IsieDL0YOgsR3sALJJXY589fk_EyaCR1Yphsbi6S6VwAZgOzO4w9wwYafR2NWYz9dNu5ZNeoDcyjJE-b.jpg?quality=95&crop=103,240,1288,1288&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720,1080x1080,1280x1280&ava=1&u=Oqrwxr9EayaiT2Bj4BgeWy5EN1di3tqHiokPkkttDs0&cs=108x108","isVip":false,"isMale":false,"popularityLevel":0,"popularity":285,"level":3,"experience":5,"isPremium":false,"isConnected":true,"canSpeak":true,"name":"Маргарита","isEliminated":false,"votesAgainst":0,"revealedCards":{"items":[],"tmpItems":[],"deletedIndexes":{},"isMovingItems":false},"cards":undefined},"9":{"isReady":true,"id":9,"sessionId":"WpQLnTcKh","avatar":"https://sun70-2.userapi.com/impg/DW4IDqvukChyc-WPXmzIot46En40R00idiUAXw/l5w5aIHioYc.jpg?quality=96&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360&sign=10ad7d7953daabb7b0e707fdfb7ebefd&u=I6EtahnrCRLlyd0MhT2raQt6ydhuyxX4s72EHGuUSoM&cs=100x100","isVip":false,"isMale":true,"popularityLevel":0,"popularity":0,"level":1,"experience":5,"isPremium":false,"isConnected":true,"canSpeak":true,"name":"Stepa","isEliminated":false,"votesAgainst":0,"revealedCards":{"items":[],"tmpItems":[],"deletedIndexes":{},"isMovingItems":false},"cards":undefined},"10":{"isReady":true,"id":10,"sessionId":"G2RnEvTH8","avatar":"https://sun70-2.userapi.com/impg/DW4IDqvukChyc-WPXmzIot46En40R00idiUAXw/l5w5aIHioYc.jpg?quality=96&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360&sign=10ad7d7953daabb7b0e707fdfb7ebefd&u=I6EtahnrCRLlyd0MhT2raQt6ydhuyxX4s72EHGuUSoM&cs=100x100","isVip":false,"isMale":true,"popularityLevel":0,"popularity":0,"level":1,"experience":0,"isPremium":false,"isConnected":true,"canSpeak":true,"name":"Kachan","isEliminated":false,"votesAgainst":0,"revealedCards":{"items":[],"tmpItems":[],"deletedIndexes":{},"isMovingItems":false},"cards":undefined}};


  const arCards = new ArraySchema<Card>();
  /* @ts-ignore */
  players.value["1"].cards.items.forEach(card => {
    const cards = new Card();
    cards.id = card.id;
    cards.active = card.active;
    cards.type = card.type;
    cards.name = card.name;
    cards.maleImageUrl = card.maleImageUrl;
    cards.femaleImageUrl = card.femaleImageUrl;
    cards.value = card.value;
    const customData = new CardCustomData();
    customData.from = cards.customData?.from;
    customData.to = cards.customData?.to;
    customData.value = cards.customData?.value;
    cards.customData = customData;
    arCards.push(card);
  });
  players.value["1"].cards = arCards;
  players.value["1"].revealedCards = new ArraySchema<Card>();

  places.value = {"0":1,"1":9,"2":10,"3":2,"4":0,"5":0,"6":0,"7":0};
  playersCount.value = 4;
  status.value = 'playing';
  turnTimeLimit.value = 30;
  turnTimeRemaining.value = 0;
  votingResults.value = undefined;
  scenario.value = {"id":"9","name":"Извержение супервулкана","description":"Йеллоустонский супервулкан извергся, выбросив в атмосферу 2 000 кубических километров пепла. Солнце скрыто, температура упала на десятки градусов, небо постоянно тёмное. Пепел забивает лёгкие, фильтры и технику. В нашем убежище всего 2 места.  Решите, кто достоин остаться.","imageUrl":"https://s3.lapa-play.ru/assets/bunker/scripts/izverzenie-supervulkana-2-1-xhnQ.png","smallImageUrl":"https://s3.lapa-play.ru/assets/bunker/scripts/izverzenie-supervulkana-1-rOco.png"};

}

watch(currentSpeakerId, (neoVal) => {
  if(currentPlayer.value?.id == currentSpeakerId.value){
    canSendCard.value = true;
  }
});

onMounted(() => {
  voteResults.value = {};
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
  //setGameStubs();
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


    &__finish-speak{
      position: absolute;
      top: calc(50% - 20px);
      text-align: center;
      width: 100%;
      display: flex;
      justify-content: center;
      cursor: pointer;

      .finish{
        background-color: #95501B;
        box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);

        .microphone-off{
          margin-top: 0;
        }
      }
    }
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