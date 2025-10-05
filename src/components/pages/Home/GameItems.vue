<template>
  <div class="game-items__list">
    <div class="sub-title">
      Играть сейчас:
    </div>
    <div class="item bunker" @click="onGameClick('bunker')">
      <div class="item__title">
        Убежище
      </div>
      <div class="item__image">
        <img src="/assets/img/games/home/home-page-bunker.png" alt="Убежище">
      </div>
    </div>

    <div class="sub-title mt-20px">
      В разработке:
    </div>

    <div class="item quiz" @click="onGameClick('quiz')">
      <game-item-coming-soon />
      <div class="item__title">
        Сила знаний
      </div>
      <div class="item__image">
        <img src="/assets/img/games/home/home-page-quiz.png" alt="Сила знаний">
      </div>
    </div>
    <div class="item voice" @click="onGameClick('voice')">
      <game-item-coming-soon />
      <div class="item__title">
        Голосовые комнаты
      </div>
      <div class="item__image">
        <img src="/assets/img/games/home/home-page-voice-rooms.png" alt="Голосовые комнаты">
      </div>
    </div>
    <div class="item draw" @click="onGameClick('draw')">
      <game-item-coming-soon />
      <div class="item__title">
        Угадай-ка
      </div>
      <div class="item__image">
        <img src="/assets/img/games/home/home-page-draw.png" alt="Угадай-ка">
      </div>
    </div>

    <div class="item callback">
      <div class="item__title">
        У меня есть идея получше!
      </div>
    </div>




  </div>
</template>
<script lang="ts" setup>
import {useAnimatedRouter} from "@/classes/utils/useAnimatedRouter.ts";
import type {INotificationsProvider} from "@/modules/NotificationsModule/Interfaces/INotificationsProvider.ts";
import {inject} from "vue";
import {NotificationsSymbol} from "@/modules/NotificationsModule/symbols.ts";
import GameItemComingSoon from "@/components/pages/Home/GameItemComingSoon.vue";

const router = useAnimatedRouter();
const notificationsProvider: INotificationsProvider | undefined = inject(NotificationsSymbol);

const onGameClick = (name: string) => {
  if(name === 'bunker') {
    notificationsProvider?.addPopup('game-bunker-game-info-popup', 'game-bunker-game-info-popup', {
      darkBg: true,
      noTitle: true,
      noPaddings: true,

    });
    //router.push({name: 'bunkerLobby'});
    return;
  }


}

</script>
<style lang="scss" scoped>

.sub-title{
  margin-bottom: 0;
  font-size: 14px;
}
.mt-20px{
  margin-top: 15px;
}
.game-items__list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 8px;
  .item{
    width: 100%;
    border-style: solid;
    border-width: 3px;
    border-radius: 12px;
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    padding-left: 12px;
    font-size: 16px;
    font-weight: bold;
    height: 68px;
    cursor: pointer;

    &__title{
      flex-shrink: 0;
    }

    &__image{
      position: relative;
      width: 100%;
      height: 100%;

      img{
        position: absolute;
        height: 68px;
        object-fit: contain;
        right: 0;
        bottom: 0;
      }
    }

    &.callback{
      margin-top: 40px;
      width: 100%;
      .item__title{
        width: 100%;
        text-align: center;
      }
    }
  }
}

[theme=dark]{
  .game-items__list {
    .item{
      border-color: #939393;
    }
  }
}
[theme=light]{
  .game-items__list {
    .item{
      &.bunker{
        border-color: #F4B04C;
        background-color: #FFE09F;
        background: linear-gradient(0deg, #FFE09F 0%, #F6C05A 100%);
        color: #AE4A03;
      }

      &.quiz{
        border-color: #90BDE4;
        background-color: #D1E2F1;
        background: linear-gradient(0deg, #D1E2F1 0%, #98C2D8 100%);
        color: #1F5B90;
      }

      &.voice{
        border-color: #D5A5D5;
        background-color: #FCE1FC;
        background: linear-gradient(0deg, #FCE1FC 0%, #E0B3E0 100%);
        color: #A243A2;
      }

      &.draw{
        border-color: #DCCF7E;
        background-color: #FBF3C6;
        background: linear-gradient(0deg, #FBF3C6 0%, #D8CA71 100%);
        color: #857408;
      }

      &.callback{
        border-color: #E89898;
        background-color: #FDDFDF;
        background: linear-gradient(0deg, #FDDFDF 0%, #EB9292 100%);
        color: #AF0E0E;
      }

    }
  }
}


@media(min-width: 360px){
  .game-items__list {
    .item {
      &.voice, &.draw {
        width: calc(50% - 4px);
      }

      &.voice{
        .item__title{
          flex-shrink: 1;
        }
      }
    }
  }
}

</style>