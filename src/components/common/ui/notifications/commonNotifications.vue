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
          'centered': popup.data?.modal
        }"
    >
      <div
          v-click-outside="($event: any) => tryClosePopup($event, ''+index, !popup.data?.noClose)"
          class="popup"
          :data-popup="index"
          :style="popup.data?.modal? {} : {bottom: 'calc(-'+ popup.clientHeight +'px)'}"
          :class="{
          ['' + popup.data?.class || '']: popup.data?.class,
          'calculated': popup.initialized,
          'no-paddings': popup.data?.noPaddings,
          'bg-blur': popup.data?.backgroundBlur,
          'no-title': popup.data?.noTitle,
          'no-bg': popup.data?.noBackground,
          'h-100': popup.data?.fullHeight,
          'bg-pink': popup.data?.pink,
          'small-popup': popup.data?.small,
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
            v-if="(popup.data?.title || popup.data?.subtitle || (!popup.data?.noClose && !popup.data?.noCloseButton && !popup.data?.noTitle))"
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
              @close="closePopup(''+index, $event)"
          />
        </div>
      </div>
    </div>
  </transition-group>
</template>
<script lang="ts" setup>

import {inject, nextTick, onBeforeUnmount, onMounted, watch} from "vue";
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
const closePopup = (key: string, event: any = null) => {
  if(key && popups.value[key]){
    popups.value[key].isOpen = false
    setTimeout(() => {
      notificationLayer?.removePopup?.(key);
      if(event && typeof event === 'function'){
        setTimeout(() => {
          event();
        }, 100)
      }
    }, popups.value[key].data?.modal ? 10 : 100)
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

const closeAllPopups = () => {
  Object.keys(popups.value).forEach((popupKey) => {
    closePopup(popupKey)
  })
}

onMounted(() => {
  window.addEventListener('popstate', closeAllPopups);
});

onBeforeUnmount(() => {
  window.removeEventListener('popstate', closeAllPopups);
})

</script>
<style lang="scss" scoped>
[theme="dark"]{
  .modal{
    .popup{
      color: #939393;
      &.bg-blur{
        background-color: rgba(51, 51, 51, 0.5);
      }
      &__title{
        .subtitle{
          color: #939393;
        }
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
  z-index: 10000;

  &.dark-bg{
    background-color: rgba(0,0,0,.1);
  }

  &.backdrop-blur{
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
  }
  .popup{
    box-shadow: 0 0 15px rgba(0,0,0,.15);

    &.no-title{
      display: flex;
      flex-direction: column;

      .popup__content{
        height: 100%;
        overflow-y: auto;
      }
    }
  }

  &.centered{
    .popup{
      bottom: unset!important;
      top: 50%;
      transform: translate(-50%, -50%);
      max-height: calc(100% - 200px);
      max-height: calc(100% - 200px - env(safe-area-inset-top, 0px));
    }
    &.active{
      .popup{
        bottom: unset!important;
      }
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
    max-height: calc(100% - 100px - env(safe-area-inset-top, 0px));
    width: calc(100% - 30px);
    max-width: 500px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 12px;
    padding: 0 20px 40px;
    background-color: var(--bg-color-component);
    color: #BC7D4D;
    //overflow-y: auto;
    //overflow-x: hidden;

    &.small-popup{
      width: 50%;
      max-width: 250px;
      //left: 25%;
      padding-bottom: 20px;
    }

    &.no-bg{
      background: unset!important;
      box-shadow: unset!important;
    }

    &.h-100{
      height: 100%;
      height: calc(100% - env(safe-area-inset-top, 0px));
    }
    &.bg-pink{
      background-color: #FFB3D2;
    }

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
      z-index: 100002;
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
        color: #BD8848
      }
    }
    &__content{
      position: relative;
      min-height: 100px;
    }
  }

}

[desktop="1"]{
  .modal{
    .popup{
      max-height: calc(100% - 40px);
    }
  }
}
</style>