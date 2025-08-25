import {defineStore} from "pinia";
import type {INotificationsStore} from "@/stores/Notifications/INotificationsStore";

export const notificationsStore = defineStore('notifications', {
    state:():INotificationsStore => ({
        notifications: {},
        isNotificationsInitialized: false,
        popups: {
            'gift-page': {
                canClose: true,
                clientHeight: 567,
                component: 'profile-gifts-popup',
                initialized: true,
                isOpen: true,
                data: {
                    darkBg: true,
                    id: 1,
                    avatar: 'https://sun70-1.userapi.com/s/v1/ig2/Mnbl4RlowjH_RK3F4WtScE7ZDNV1bEffN0zmkmJMPRlcSU1aSqCExpd3DgQ8pKFC1Lat8JMNx74crBuhsdZiCV7A.jpg?quality=95&crop=67,1,760,760&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720&ava=1&u=xcC0HAjSZgUX3g2E42IUjU3tG-JqrJWCoUrkvX060A8&cs=100x100',
                    name: 'Виталий',
                    noPaddings: true,
                    noTitle: true,
                    pink: true,
                }
            }
        },
        bigGifts: {},
    })
})