<template>
  <div class="rounded-box">
    <div class="game-name">
      Убежище
    </div>

    <div class="start-game" @click="startGame">
      Играть
    </div>

    <ui-btn @click="createRoom">Создать комнату</ui-btn>

    <transition name="opacity">
      <div class="spin" v-if="videoRewardAdvKey">
        <GetSpin @click="getSpinHasBeenClicked"/>
      </div>
    </transition>

  </div>
</template>
<script lang="ts" setup>

import UiBtn from "@/components/common/ui/UiBtn.vue";
import {storeToRefs} from "pinia";
import {bridgeStore} from "@/stores/Bridge/bridgeStore.ts";
import GetSpin from "@/components/pages/Home/GetSpin.vue";
import type {INotificationsProvider} from "@/modules/NotificationsModule/Interfaces/INotificationsProvider.ts";
import {inject} from "vue";
import {NotificationsSymbol} from "@/modules/NotificationsModule/symbols.ts";
import {useAnimatedRouter} from "@/classes/utils/useAnimatedRouter.ts";
import type {IReverbProvider} from "@/modules/ReverbModule/Interfaces/IReverbProvider.ts";
import {ReverbSymbol} from "@/modules/ReverbModule/symbols.ts";


const {videoRewardAdvKey} = storeToRefs(bridgeStore());
const router = useAnimatedRouter();

const notificationsProvider: INotificationsProvider | undefined = inject(NotificationsSymbol);
const reverbProvider: IReverbProvider | undefined = inject(ReverbSymbol);

const createRoom = () => {
  notificationsProvider?.addPopup('create-bunker-room', 'game-bunker-create-room-popup', {
    darkBg: true,
    title: 'Убежище: параметры комнаты',

  })
}
const startGame = () => {
  router.push({name: 'bunkerGame'})
}

const onSubmitRewardSpinner = () => {
  const rqkey = videoRewardAdvKey.value;
  reverbProvider?.sendMessage?.('reverb-oussrna', {rqkey});
}

const getSpinHasBeenClicked = () => {
  notificationsProvider?.addPopup('approve-show-reward', 'simple-submit-popup', {
    modal: true,
    darkBg: true,
    title: 'Получить бонусы',
    middle: true,
    message: 'Для получения награды будет воспроизведен рекламный ролик',
    onSubmit: () => {onSubmitRewardSpinner()}
  })

  // notificationsProvider?.addPopup('reward-wheel', 'reward-wheel-popup', {
  //   modal: true,
  //   darkBg: true,
  //   noTitle: true,
  //   noPaddings: true,
  // });
}


</script>
<style lang="scss" scoped>
.rounded-box{
  background-color: #FFF6E9;
  text-align: center;
  border-radius: 20px;
  padding: 15px;
  border: 2px solid #FBDFC8;
  text-transform: uppercase;
  font-size: 18px;
  font-weight: 600;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.game-name{
  font-size: 20px;
  font-weight: bold;
}

.start-game{
  color: #FFF6E9;
  background-color: #FFB890;
  border-color: #FB9B75;
  border-style: solid;
  border-width: 2px;
  border-radius: 100px;
  cursor: pointer;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.05);
  transition: background-color .3s ease-out, box-shadow .3s ease-out;
  font-size: 28px;
  font-weight: bold;
  padding: 12px 16px;

  &:hover{
    background-color: #f39673;
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.1);
  }

}

.spin{
  position: absolute;
  right: -15px;
  top: -52px;
}

[theme="dark"]{
  .rounded-box{
    background-color: #222222;
    border-color: #363738;
  }

  .start-game{
    background-color: #DE6431;
    border-color: #363738;

    &:hover{
      background-color: #f47743;
    }
  }
}

</style>