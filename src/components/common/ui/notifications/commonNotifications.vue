<template>
  <transition-group name="opacity">
    <div
        v-for="(popup, index) in popups"
        :key="'pp-' + index"
        class="modal"
        :class="{
          'active': popup.isOpen,
          'backdrop-blur': popup.data?.backdropBlur,
          'dark-bg': popup.data?.darkBg,
        }"
    >
      <div
          v-click-outside="($event: any) => tryClosePopup($event, ''+index, !popup.data?.noClose)"
          class="popup"
          :data-popup="index"
          :style="{bottom: 'calc(-'+ popup.clientHeight +'px)'}"
          :class="{
          ['' + popup.data?.class || '']: popup.data?.class,
          'calculated': popup.initialized,
          'no-paddings': popup.data?.noPaddings,
          'bg-blur': popup.data?.backgroundBlur
        }"
      >
        <div
            v-if="!popup.data?.noClose && !popup.data?.noCloseButton"
            class="popup__close"
            @click="closePopup('' + index)"
        >
          <ui-icon class="close-button" name="close" />
        </div>
        <div
            v-if="(popup.data?.title || popup.data?.subtitle || (!popup.data?.noClose && !popup.data?.noCloseButton))"
            class="popup__title"
        >
          <div v-if="popup.data?.title" v-html="popup.data?.title"></div>
          <div v-if="popup.data?.subTitle" class="subtitle" v-html="popup.data?.subTitle"></div>
        </div>
        <div class="popup__content">
          <AsyncPopupItem
              :component="popup.component"
              :data="popup.data || {}"
              @ready="openPopup(''+index)"
              @close="closePopup(''+index)"
          />
        </div>
      </div>
    </div>
  </transition-group>
</template>
<script lang="ts" setup>

import {inject, nextTick, watch} from "vue";
import {NotificationsSymbol} from "@/modules/NotificationsModule/symbols";
import type {INotificationsProvider} from "@/modules/NotificationsModule/Interfaces/INotificationsProvider";
import {storeToRefs} from "pinia";
import {notificationsStore} from "@/stores/Notifications/notificationsStore";
import type {TNotification} from "@/stores/Notifications/Types/TNotification";
import type {IziToast, IziToastProgress, IziToastSettings} from "izitoast";
import {ClickOutside} from "@/classes/directives/clickOutside";
import UiIcon from "@/components/common/icons/UiIcon.vue";
import AsyncPopupItem from "@/components/common/ui/notifications/AsyncPopupItem.vue";


const { notifications, isNotificationsInitialized, popups } = storeToRefs(notificationsStore());
const notificationLayer: INotificationsProvider  |undefined = inject(NotificationsSymbol);
const vClickOutside = ClickOutside;

const tryClosePopup = (event:any, key:string, canClose:boolean = true) => {
  if(!canClose){
    return
  }
  // if(
  //     event?.target?.closest('#no-close') //если будут какие-то элементы на экране, по клику на которые не закрывать попап
  // ){
  //   return
  // }

  nextTick(() => {
    if(key && popups.value[key] && Object.keys(popups.value).indexOf(key) === ((Object.keys(popups.value).length || 0) -1)){
      if(!popups.value[key].isOpen || !popups.value[key].canClose){
        return
      }
      closePopup(key)
    }
  })
}
const closePopup = (key: string) => {
  if(key && popups.value[key]){
    popups.value[key].isOpen = false
    setTimeout(() => {
      notificationLayer?.removePopup?.(key);
    }, 100)
  }
}

const openPopup = (key: string) => {
  if(key && popups.value[key]){
    nextTick(() => {
      popups.value[key].clientHeight = document.querySelector('[data-popup="'+key+'"]')?.clientHeight || 0;
      setTimeout(() => {
        popups.value[key].isOpen = true;
        popups.value[key].initialized = true;
        setTimeout(() => {
          popups.value[key].canClose = true;
        }, 20)
      }, 50)
    })
  }
}

let iziToast:{
  IziToastProgress: IziToastProgress;
  IziToast: IziToast;
  IziToastPosition: "bottomRight" | "bottomLeft" | "topRight" | "topLeft" | "topCenter" | "bottomCenter" | "center";
  IziToastTransitionIn: "bounceInLeft" | "bounceInRight" | "bounceInUp" | "bounceInDown" | "fadeIn" | "fadeInDown" | "fadeInUp" | "fadeInLeft" | "fadeInRight" | "flipInX";
  IziToastSettings: IziToastSettings;
  IziToastTransitionOut: "fadeOut" | "fadeOutUp" | "fadeOutDown" | "fadeOutLeft" | "fadeOutRight" | "flipOutX";
  readonly default: IziToast
};

const commonParams = {
  progressBar: false,
  close: true,
  displayMode: 0,
  messageColor: '#fff',
  animateInside: false,
  class: 'notification-item'
}

watch(notifications, async (neoVal:{[key:string]:TNotification}) => {
  const isBigScreen = window.innerWidth >= 768
  const position = isBigScreen ? 'topRight' : 'topCenter'
  const transitionIn = 'fadeInLeft';
  const transitionOut = 'fadeOutRight';


  if(!isNotificationsInitialized.value){
    /*@ts-ignore*/
    iziToast = await import('izitoast');
    await import('izitoast/dist/css/iziToast.min.css');
    notificationLayer?.setNotificationsInitialized();
  }

  Object.keys(neoVal).forEach((key) => {
    if(!neoVal[key].hasShown){

      notificationLayer?.setNotificationShown(key);

      let backgroundColor = getNotificationBackgroundColor(neoVal[key]['type']);

      /*@ts-ignore*/
      iziToast.show(Object.assign(commonParams, {
        id: 'toast' + key,
        position: position,
        message: neoVal[key]['message'],
        timeout: neoVal[key]['timeout'] || (neoVal[key]['timeout'] === false ? false : 5000),
        backgroundColor: backgroundColor,
        transitionIn: transitionIn,
        transitionOut: transitionOut,
        onClosed: () => {
          notificationLayer?.removeNotification(key)
        },
      }))
    }
  })
}, {
  deep: true
})

const getNotificationBackgroundColor = (eType?: TNotification['type']) => {
  switch (eType){
    case 'warning':
      return 'rgba(236,155,97,0.8)';
    case 'success':
      return 'rgba(107, 211, 144, 0.80)';
    case 'info':
      return 'rgba(211,206,107,0.8)';
    default:
      return 'rgba(255, 0, 0, 0.75)';
  }
}

</script>
<style lang="scss" scoped>
[theme="dark"]{
  .modal{
    .popup{
      &.bg-blur{
        background-color: rgba(51, 51, 51, 0.5);
      }
    }
  }
}
[theme="light"]{
  .modal{
    .popup{
      &.bg-blur{
        background-color: rgba(237, 238, 240, 0.5);
      }
    }
  }
}

.modal{
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 1;

  &.dark-bg{
    background-color: rgba(0,0,0,.1);
  }

  &.backdrop-blur{
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);

    .popup{
      box-shadow: 0 0 10px rgba(0,0,0,.2);
    }
  }

  &.active{
    .popup{
      bottom: 10px!important;
    }
  }

  .close-button{
    width: 34px;
    height: 34px;
  }

  .popup{
    position: fixed;
    bottom: -100%;
    max-height: calc(100% - 100px);
    width: calc(100% - 30px);
    left: 15px;
    border-radius: 12px;
    padding: 0 20px 40px;
    background-color: var(--bg-color-component);
    color: var(--text-primary);
    //overflow-y: auto;
    //overflow-x: hidden;

    &.no-paddings{
      padding: 0;
    }
    &.calculated{
      transition: bottom .1s ease-in-out;
    }

    &.bg-blur{
      backdrop-filter: blur(10px);
      .popup__title{
        background-color: rgba(0,0,0,0);
      }
    }
    &__close{
      position: absolute;
      z-index: 2;
      right: -15px;
      top: -20px;
      padding: 10px;
      cursor: pointer;
    }

    &__title{
      position: sticky;
      padding-top: 20px;
      top: 0;
      border-bottom: 1px solid rgba(0,0,0,.1);
      padding-bottom: 15px;
      font-size: 18px;
      background-color: var(--bg-color-component);
      margin-bottom: 15px;

      &.can-close{
        padding-right: 35px;
      }

      .subtitle{
        padding-top: 5px;
        font-size: 14px;
        color: var(--text-secondary)
      }
    }
    &__content{
      position: relative;
      min-height: 100px;
    }
  }

}
</style>