import {defineStore} from "pinia";
import type {INotificationsStore} from "@/stores/Notifications/INotificationsStore";

export const notificationsStore = defineStore('notifications', {
    state:():INotificationsStore => ({
        notifications: {},
        isNotificationsInitialized: false,
        popups: {
            'buy-money': {
                canClose: true,
                clientHeight: 900,
                component: 'shop-popup',
                initialized: true,
                isOpen: true,
                data: {
                    darkBg: true,
                    modal: true,
                    noPaddings: true,
                    noTitle: true,
                }
            }
        },
        bigGifts: {},
    })
})