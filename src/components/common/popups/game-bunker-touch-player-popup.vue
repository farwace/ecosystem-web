<template>
  <div class="bunker-popup">
    <div class="bunker-popup__player" ref="playerRef">
      <div>
        <div class="player">
          <div class="player__avatar">
            <img :src="player.avatar" :alt="player.name">
          </div>
          <div class="player__name">
            <div class="player__name__text">
              <span class="player-name">{{ player.name }}</span> <UiIcon class="player-sex" :name="player.isMale ? 'male' : 'female'" />
            </div>
            <div>
              <ProfileTitles small :profile="profile" />
            </div>
          </div>
        </div>

        <div class="admin-buttons" v-if="isHost && player.id != id">
          <span @click="kickPlayer()">Исключить</span>
          <span @click="setLeader()" v-if="!player.isBot">Сделать лидером</span>
        </div>
      </div>

      <div class="buttons" v-if="!player.isBot">
        <!-- todo: проверка есть ли уже игрок в друзьях? -->
<!--        <div class="btn btn-add" @click="addToFriends" v-if="player.id != id && true">
          <UiIcon name="invite" />
          Добавить
        </div>-->

        <div class="btn btn-gift" @click="openGiftPopup">
          <UiIcon name="gift" />
          Подарок
        </div>
      </div>
    </div>

    <div class="bunker-popup__cards" v-if="(player.revealedCards?.length || 0) > 0 && widthIsCalculated">
      <div @click="showCardPopup(card)" class="item" v-for="card in player.revealedCards" :key="`player-${player.id}-revealed-card-${card.id}`">
        <BunkerCard :max-width="maxCardWidth" :card="card" :is-male="!!props.player?.isMale" />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type {Player} from "@/components/games/bunker/schemas/schemas/Player.ts";
import UiIcon from "@/components/common/icons/UiIcon.vue";
import {computed, inject, nextTick, onMounted, ref} from "vue";
import type {TUserProfile} from "@/modules/ApiModule/Types/TUserProfile.ts";
import ProfileTitles from "@/components/pages/Profile/ProfileTitles.vue";
import type {IGiftsProvider} from "@/modules/ApiModule/Interfaces/IGiftsProvider.ts";
import {GiftsProviderSymbol} from "@/modules/ApiModule/symbols.ts";
import {storeToRefs} from "pinia";
import {ecosystemStore} from "@/stores/Ecosystem/ecosystemStore.ts";
import BunkerCard from "@/components/games/bunker/components/BunkerCard.vue";
import {NotificationsSymbol} from "@/modules/NotificationsModule/symbols.ts";
import type {INotificationsProvider} from "@/modules/NotificationsModule/Interfaces/INotificationsProvider.ts";

const notificationsProvider: INotificationsProvider | undefined = inject(NotificationsSymbol);

const props = defineProps<{
  kickCallback?: () => void,
  setLeaderCallback?: () => void,
  isHost?: boolean,
  player: Player
}>();

const playerRef = ref<HTMLDivElement | null>(null);
const widthIsCalculated = ref<boolean>(false);
const maxCardWidth = ref<string>();

const {id} = storeToRefs(ecosystemStore());

const giftsProvider: IGiftsProvider | undefined = inject(GiftsProviderSymbol);

const profile = computed(():TUserProfile => {
  return {
    premium: props.player.isPremium,
    vip: props.player.isVip,
    experience: props.player.experience,
    avatar: props.player.avatar,
    avatarBig: props.player.avatar,
    id: props.player.id,
    lvl: props.player.level,
    popularity: props.player.popularity,
    popularityLevel: props.player.popularityLevel,
    name: props.player.name,
    sex: props.player.isMale ? 1 : 0,
    nextLevelExperience: 0,
    nextLevelPopularity: 0,
    isAnonymous: false,
    online: true,
    topFans: [],
    topGifts: [],
    giftsCount: 0,
    recentAchievements: [],
  }
})

const emit = defineEmits(["close"]);
const openGiftPopup = () => {
  giftsProvider?.openGiftsPopup(props.player.id, props.player.avatar);
}

const addToFriends = () => {
  //todo: проверка на отображение кнопки - если нет в друзьях.
  //todo: По клику добавлять в друзья!
}



const kickPlayer = () => {
  props?.kickCallback?.();
  emit("close");
}
const setLeader = () => {
  props?.setLeaderCallback?.();
  emit("close");
}

const showCardPopup = (card: any) => {
  notificationsProvider?.addPopup('game-bunker-player-card-popup', 'game-bunker-revealed-card-popup', {
    modal: true,
    small: true,
    noTitle: true,
    noBackground: true,
    noPaddings: true,
    noScroll: true,
    class: 'game-bunker',
    card: card,
    maxHeight: 200,
    player: props.player,
    noPlayer: true,
  })
}

onMounted(() => {
  nextTick(() => {
    if(playerRef.value){
      const blockWidth = playerRef.value.getBoundingClientRect().width;
      maxCardWidth.value = (Math.floor(blockWidth / 4) - 6)+'px';
      widthIsCalculated.value = true;
    }
  })
})

</script>
<style lang="scss" scoped>

[theme=dark]{
  .bunker-popup{
    &__player{
      .admin-buttons{
        border-color: rgba(255,255,255,.1);
      }
    }
  }
}

.bunker-popup{
  &__player{
    background-color: var(--bg-color-component);
    border-radius: 12px;
    padding: 15px;
    display: flex;
    flex-direction: column;
    gap: 20px;

    .player{
      display: flex;
      flex-wrap: nowrap;
      gap: 15px;
      align-items: start;

      &__avatar{
        margin-top: 2px;
        flex-shrink: 0;
        width: 44px;
        height: 44px;
        border-radius: 100%;
        overflow: hidden;
      }
      &__name{
        flex-grow: 1;
        position: relative;
        overflow: hidden;

        &__text{
          margin-bottom: 4px;
          display: flex;
          align-items: center;
        }

        .player-name{
          overflow: hidden;
          flex-grow: 1;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .player-sex{
          width: 1rem;
          height: 1rem;
          display: inline;
          vertical-align: middle;
          margin-top: -2px;
          flex-shrink: 0;
        }
      }
    }

    .buttons{
      display: flex;
      flex-wrap: nowrap;
      gap: 10px;
    }

    .admin-buttons{
      padding: 10px 0;
      border-bottom: 1px solid rgba(0,0,0,.1);
      display: flex;
      flex-wrap: nowrap;
      gap: 10px;
      font-size: 12px;
      justify-content: space-between;

      span{
        cursor: pointer;
        padding: 2px 0;
      }
    }
  }

  .btn{
    padding: 8px 8px 6px 8px;
    border-radius: 100px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    flex-shrink: 0;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    gap: 6px;

    transition: box-shadow .3s ease-out, background-color .3s ease-out;

    svg{
      width: 15px;
      height: 15px;
      flex-shrink: 0;
    }

    &.btn-gift{
      background-color: #FF7E85;
      color: #FFEDCB;
      box-shadow: 0 4px 0 #F06470;
      &:hover{
        background-color: #ef7178;
        box-shadow: 0 4px 0 #dd5864;
      }
    }

    &.btn-add{
      background-color: #89D8EF;
      color: #FEF5DA;
      box-shadow: 0 4px 0 #64C9EB;
      &:hover{
        background-color: #7fcee4;
        box-shadow: 0 4px 0 #59bbdb;
      }
    }
  }


  &__cards{
    display: grid;
    justify-content: space-around;
    gap: 2px;
    margin-top: 10px;

    grid-template-areas:
    "A B C D"
    "E F G H";

    .item{
      &:nth-child(1) { grid-area: A; }
      &:nth-child(2) { grid-area: B; }
      &:nth-child(3) { grid-area: C; }
      &:nth-child(4) { grid-area: D; }
      &:nth-child(5) { grid-area: E; }
      &:nth-child(6) { grid-area: F; }
      &:nth-child(7) { grid-area: G; }
      &:nth-child(8) { grid-area: H; }
    }

    ::v-deep(.card){

    }
  }
}
</style>