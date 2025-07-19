import type {TNotification} from "@/stores/Notifications/Types/TNotification";

export interface INotificationsStore {
    notifications: { [key: string]: TNotification },
    isNotificationsInitialized: boolean,
    popups: {[key:string]: any}
}