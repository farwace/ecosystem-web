import type {INotificationsProvider} from "@/modules/NotificationsModule/Interfaces/INotificationsProvider";
import {notificationsStore} from "@/stores/Notifications/notificationsStore";
import type {Store} from "pinia";
import type {INotificationsStore} from "@/stores/Notifications/INotificationsStore";
import type {TNotification} from "@/stores/Notifications/Types/TNotification";
import type {TPopupData} from "@/modules/NotificationsModule/Types/TPopupData";
import {injectable} from "inversify";
import type {App} from "vue";
import type {TSendGift} from "@/stores/Ecosystem/Types/TSendGift.ts";

@injectable()
export class NotificationsProvider implements INotificationsProvider {
    private notificationsStore: Store<'notifications', INotificationsStore>
    constructor() {
        this.notificationsStore = notificationsStore();
    }

    install(app: App, symbol: symbol) {
        app.provide(symbol, this);
    }

    setNotificationsInitialized() {
        this.notificationsStore.$patch({
            isNotificationsInitialized: true
        })
    }

    addNotification(notification:TNotification){
        let key = Date.now().toString()

        if(notification.key){
            key = notification.key
        }
        this.notificationsStore.$patch((state) => {
            state.notifications[key] = notification
        })
    }

    removeNotification(key:string){
        this.notificationsStore.$patch((state) => {
            if(state.notifications[key]){
                delete state.notifications[key]
            }
        })
    }

    setNotificationShown(key: string) {
        this.notificationsStore.$patch((state) => {
            if(state.notifications[key]){
                state.notifications[key]['hasShown'] = true
            }
        })
    }


    addPopup(key:string, componentName:string, ppData: TPopupData) {
        this.notificationsStore.$patch((state) => {
            if(state.popups[key]){
                return
            }
            state.popups[key] = {
                component: componentName,
                isOpen: false,
                canClose: false,
                data: ppData,
                clientHeight: 0,
            }
        })
    }

    removePopup(key:string){
        this.notificationsStore.$patch((state) => {
            if(state.popups[key]){
                delete state.popups[key]
            }
        })
    }


    addBigGift(key: string, gift: TSendGift) {
        this.notificationsStore.$patch(state => {
            state.bigGifts[key] = gift;
        });

        setTimeout(() => {
            this.notificationsStore.$patch(state => {
                delete state.bigGifts[key];
            });
        }, 750);
    }
}