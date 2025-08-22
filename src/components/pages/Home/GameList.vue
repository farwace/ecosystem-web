<template>
  <div class="rounded-box">
    <div class="game-name">
      Силы знаний
    </div>

    <div class="start-game" @click="startGame">
      Играть
    </div>

    <ui-btn @click="createRoom">Создать комнату</ui-btn>

    <transition name="opacity">
      <div class="spin" v-if="videoAdvAccepted">
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

const notificationsProvider: INotificationsProvider | undefined = inject(NotificationsSymbol);
const {videoAdvAccepted} = storeToRefs(bridgeStore());

const createRoom = () => {
  alert('Создать комнату');
}
const startGame = () => {
  alert('Играть');
}

const getSpinHasBeenClicked = () => {
  notificationsProvider?.addPopup('reward-wheel', 'reward-wheel-popup', {
    modal: true,
    darkBg: true,
    noTitle: true,
  });
}


</script>
<style lang="scss" scoped>
.rounded-box{
  background-color: var(--box-bg);
  text-align: center;
  border-radius: 20px;
  padding: 15px;
  border: 2px solid var(--box-border);
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
  color: var(--btn-primary-text);
  background-color: var(--btn-primary-bg);
  border-color: var(--btn-primary-border);
  border-style: solid;
  border-width: 2px;
  border-radius: 100px;
  cursor: pointer;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.05);

  font-size: 28px;
  font-weight: bold;
  padding: 12px 16px;

}

.spin{
  position: absolute;
  right: -15px;
  top: -52px;
}
</style>