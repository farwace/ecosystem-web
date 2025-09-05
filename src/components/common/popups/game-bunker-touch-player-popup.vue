<template>
  <div class="bunker-popup">
    <div class="bunker-popup__player">
      <div>
        <div class="player">
          <div class="player__avatar">
            <img :src="player.avatar" :alt="player.name">
          </div>
          <div class="player__name">
            <div class="mb-2">
              {{ player.name }} <UiIcon class="player-sex" :name="player.isMale ? 'male' : 'female'" />
            </div>
            <div>
              <ProfileTitles small :profile="profile" />
            </div>
          </div>
        </div>

        <div class="admin-buttons" v-if="isHost && player.id != id">
          <span @click="kickPlayer()">Исключить</span>
          <span @click="setLeader()">Сделать лидером</span>
        </div>
      </div>

      <div class="buttons">
        <div class="btn btn-add" @click="addToFriends" v-if="player.id != id && true"> <!-- todo: проверка есть ли уже игрок в друзьях? -->
          <UiIcon name="invite" />
          Добавить
        </div>

        <div class="btn btn-gift" @click="openGiftPopup">
          <UiIcon name="gift" />
          Подарок
        </div>
      </div>
    </div>

    <div class="bunker-popup__cards" v-if="player.cards">
      <!-- todo: display !Player Cards! -->
    </div>
  </div>
</template>
<script lang="ts" setup>
import type {Player} from "@/components/games/bunker/schemas/schemas/Player.ts";
import UiIcon from "@/components/common/icons/UiIcon.vue";
import {computed, inject} from "vue";
import type {TUserProfile} from "@/modules/ApiModule/Types/TUserProfile.ts";
import ProfileTitles from "@/components/pages/Profile/ProfileTitles.vue";
import type {IGiftsProvider} from "@/modules/ApiModule/Interfaces/IGiftsProvider.ts";
import {GiftsProviderSymbol} from "@/modules/ApiModule/symbols.ts";
import {storeToRefs} from "pinia";
import {ecosystemStore} from "@/stores/Ecosystem/ecosystemStore.ts";

const props = defineProps<{
  kickCallback?: () => void,
  setLeaderCallback?: () => void,
  isHost?: boolean,
  player: Player
}>();

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
  .mb-2{
    margin-bottom: 4px;
  }
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
        overflow: hidden;
        text-wrap: nowrap;

        .player-sex{
          width: 1rem;
          height: 1rem;
          display: inline;
          vertical-align: middle;
          margin-top: -2px;
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
}
</style>