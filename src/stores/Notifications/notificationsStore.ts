import {defineStore} from "pinia";
import type {INotificationsStore} from "@/stores/Notifications/INotificationsStore";

export const notificationsStore = defineStore('notifications', {
    state:():INotificationsStore => ({
        notifications: {},
        isNotificationsInitialized: false,
        popups: {}
    })
})