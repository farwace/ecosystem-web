<template>
  <div class="spin" :class="{'active': !!videoRewardAdvKey}" @click="getSpinHasBeenClicked">
    <div class="spin-lock" v-if="!videoRewardAdvKey">
      <UiIcon name="lock" />
    </div>
    <GetSpin/>
  </div>
</template>
<script setup lang="ts">
import GetSpin from "@/components/pages/Home/GetSpin.vue";
import {storeToRefs} from "pinia";
import {bridgeStore} from "@/stores/Bridge/bridgeStore.ts";
import type {INotificationsProvider} from "@/modules/NotificationsModule/Interfaces/INotificationsProvider.ts";
import {inject} from "vue";
import {NotificationsSymbol} from "@/modules/NotificationsModule/symbols.ts";
import type {IPlatformEvents} from "@/modules/EventsModule/Interfaces/IPlatformEvents.ts";
import {PlatformEventsSymbol} from "@/modules/EventsModule/symbols.ts";
import UiIcon from "@/components/common/icons/UiIcon.vue";

const {videoRewardAdvKey} = storeToRefs(bridgeStore());

const notificationsProvider: INotificationsProvider | undefined = inject(NotificationsSymbol);
const bridgeProvider: IPlatformEvents | undefined = inject(PlatformEventsSymbol);


const onSubmitRewardSpinner = () => {
  const rqkey = videoRewardAdvKey.value;
  bridgeProvider?.startRewardAdds(rqkey);
}

const getSpinHasBeenClicked = () => {
  if(!videoRewardAdvKey.value) {
    bridgeProvider?.checkRewardNativeAdds?.();
    notificationsProvider?.addPopup('show-reward-not-available', 'simple-popup', {
      modal: true,
      darkBg: true,
      title: 'Получить бонусы',
      middle: true,
      message: 'Реклама недоступна. Попробуйте еще раз позже',
    })
    return;
  }
  notificationsProvider?.addPopup('approve-show-reward', 'simple-submit-popup', {
    modal: true,
    darkBg: true,
    title: 'Получить бонусы',
    middle: true,
    message: 'Для получения награды будет воспроизведен рекламный ролик',
    onSubmit: () => {onSubmitRewardSpinner()}
  })
}

</script>
<style lang="scss" scoped>

[theme="dark"]{
  .spin{
    filter: grayscale(1);
    transform: translate3d(0, 0, 0);
    &.active {
      filter: none;
    }
  }
}

.spin{
  position: relative;
  &.active{
    cursor: pointer;
  }
}

.spin-lock{
  position: absolute;
  z-index: 2;
  left: calc(50% - 19px);
  top: calc(50% - 30px);
  svg{
    width: 38px;
    height: 38px;
  }
}
</style>