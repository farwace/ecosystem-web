<template>
  <div class="page-container">
    <div class="header">
      <user-avatar :vip="!!subscription?.personalAccess" :alarm="hasUnclaimedCompletedAchievement" :first-name="firstName" :avatar="avatar" @click="() => id && router.push({name: 'profile', params: {id: id}})"/>
      <user-experience />
    </div>

    <div class="game-list">
      <game-list />
    </div>

    <div class="btn-list">
      <menu-list />
    </div>

<!--    <div class="settings-block">
      <MenuItem @click="openSettings" icon="settings">Настройки</MenuItem>
    </div>-->
    <div class="add-to-block" v-if="!inFavorites && !inHomeScreen && false">
      <div @click="addToFavorite" class="add-to-favorite" v-if="!inFavorites">
        <ui-icon class="favorite-icon" name="star"/>
        <span>Добавить в<br/>избранное</span>
      </div>
    </div>

    <transition name="opacity">
      <div class="return-to-game" v-if="inGameRoom?.roomId">
        <div class="return-to-game__close">
          <UiIcon name="close" @click="inGameRoom = undefined"/>
        </div>
        <div v-if="inGameRoom?.code == 'bunker'" class="bunker" @click="returnToRoom(inGameRoom.roomId)">
          <div class="bunker__title">
            Вернуться в игру?
          </div>
          <div class="bunker__image">
            <img src="/assets/img/games/bunker/return.png" alt="Вернуться в игру">
          </div>
          <div class="bunker__button">
            Играть
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>
<script lang="ts" setup>

import UserAvatar from "@/components/pages/Home/UserAvatar.vue";
import UserExperience from "@/components/pages/Home/UserExperience.vue";
import GameList from "@/components/pages/Home/GameList.vue";
import MenuList from "@/components/pages/Home/MenuList.vue";
import UiIcon from "@/components/common/icons/UiIcon.vue";
import {storeToRefs} from "pinia";
import {bridgeStore} from "@/stores/Bridge/bridgeStore.ts";
import {ecosystemStore} from "@/stores/Ecosystem/ecosystemStore.ts";
import {achievementsStore} from "@/stores/Achievements/achievementsStore.ts";
import {useAnimatedRouter} from "@/classes/utils/useAnimatedRouter.ts";
import {inject, onActivated, onMounted, watch} from "vue";
import {NotificationsSymbol} from "@/modules/NotificationsModule/symbols.ts";
import type {INotificationsProvider} from "@/modules/NotificationsModule/Interfaces/INotificationsProvider.ts";
import type {TDailyReward} from "@/modules/EventsModule/Types/TDailyRevard.ts";
import {gameStore} from "@/stores/Game/gameStore.ts";
import type {IPlatformEvents} from "@/modules/EventsModule/Interfaces/IPlatformEvents.ts";
import {PlatformEventsSymbol} from "@/modules/EventsModule/symbols.ts";
import {Console} from "@/classes/utils/Console.ts";
import type {IReverbProvider} from "@/modules/ReverbModule/Interfaces/IReverbProvider.ts";
import {ReverbSymbol} from "@/modules/ReverbModule/symbols.ts";

const {id, firstName, avatar, subscription} = storeToRefs(ecosystemStore());
const {inFavorites, inHomeScreen} = storeToRefs(bridgeStore());
const {hasUnclaimedCompletedAchievement} = storeToRefs(achievementsStore());
const router = useAnimatedRouter();
const {inGameRoom} = storeToRefs(gameStore());

const reverbProvider: IReverbProvider | undefined = inject(ReverbSymbol);
const bridgeProvider: IPlatformEvents | undefined = inject(PlatformEventsSymbol);
const notificationsProvider: INotificationsProvider | undefined = inject(NotificationsSymbol);

const returnToRoom = (roomId: string) => {
  router.push({name: 'bunkerGame', query: {"room_id": roomId}});
}

const openSettings = () => {

}

const addToFavorite = () => {
  alert('Добавить в избранное')
}

onMounted(() => {
  if(id.value > 0){
    bridgeProvider?.checkRewardNativeAdds?.();
    bridgeProvider?.displayBottomBn?.();
  }
});

watch(id, (neoVal) => {
  if(neoVal > 0){
    //todo: проверять еще и на отображение онбординга
    bridgeProvider?.displayBottomBn?.();
    bridgeProvider?.checkRewardNativeAdds?.();
  }
})

</script>
<style lang="scss" scoped>
.page-container{
  padding: 20px;
  overflow-y: auto;
  max-height: 100%;
}

.header{
  display: flex;
  flex-wrap: nowrap;
  gap: 15px;
}

.game-list{
  margin-top: 20px;
}

.btn-list{
  display: flex;
  flex-wrap: nowrap;
  gap: 15px;
  justify-content: space-between;
  margin-top: 25px;
}

.settings-block{
  position: fixed;
  bottom: 30px;
  left: 15px;
}

.add-to-block{
  position: fixed;
  bottom: 35px;
  right: 15px;
}
.add-to-favorite{
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 7px;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  border-radius: 100px;
  padding: 6px 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: background-color .3s ease-out;
}
.favorite-icon{
  width: 45px;
  height: 45px;
}

@media(min-width: 390px){
  .header{
    gap: 28px;
  }
}


[theme=dark]{
  .add-to-favorite{
    background-color: #222222;
    &:hover{
      background-color: #2d2c2c;
    }

    :deep(svg){
      .dark-bg-1{
        fill: #FF944C;
      }
      .dark-bg-2{
        fill: #E97B40;
      }
    }
  }

  .return-to-game{
    .bunker{
      background-color: #222222;
      color: #939393;

      &__button{
        background-color: #E97B40;
        border-color: #B1742B;
        color: #FFF6E9;
      }
    }
  }
}

.return-to-game{
  position: fixed;
  z-index: 10;
  right: 15px;
  bottom: 40px;

  &__close{
    position: absolute;
    cursor: pointer;
    top: -15px;
    right: -10px;
    svg{
      width: 30px;
      height: 30px;
    }
  }

  .bunker{
    padding: 10px;
    border-radius: 12px;
    text-align: center;
    font-weight: 600;
    cursor: pointer;
    background-color: #FFE6C2;
    color: #976129;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    align-items: center;

    &__title{
      margin-bottom: 5px;
    }

    &__button{
      cursor: pointer;
      margin-top: -20px;
      position: relative;
      border-radius: 100px;
      background-color: #FFD06D;
      border: 3px solid #B1742B;
      padding: 2px 30px;
      margin-bottom: 5px;
    }
  }
}
</style>