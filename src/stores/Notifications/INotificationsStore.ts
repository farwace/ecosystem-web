import type {TNotification} from "@/stores/Notifications/Types/TNotification";
import type {TSendGift} from "@/stores/Ecosystem/Types/TSendGift.ts";

export interface INotificationsStore {
    notifications: { [key: string]: TNotification },
    isNotificationsInitialized: boolean,
    popups: {[key:string]: any}
    bigGifts: {[key: string]: TSendGift };
}