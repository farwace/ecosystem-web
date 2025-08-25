import {defineStore} from "pinia";
import type {INotificationsStore} from "@/stores/Notifications/INotificationsStore";

export const notificationsStore = defineStore('notifications', {
    state:():INotificationsStore => ({
        notifications: {},
        isNotificationsInitialized: false,
        popups: {},
        //     'daily-missions': {
        //         canClose: true,
        //         clientHeight: 567,
        //         component: 'daily-missions',
        //         initialized: true,
        //         isOpen: true,
        //         data: {
        //             darkBg: true,
        //             noPaddings: true,
        //             noTitle: true,
        //         }
        //     }
        // },
        bigGifts: {},
    })
})