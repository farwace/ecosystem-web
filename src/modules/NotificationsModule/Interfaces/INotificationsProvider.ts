import type {TNotification} from "@/stores/Notifications/Types/TNotification";
import type {TPopupData} from "@/modules/NotificationsModule/Types/TPopupData";
import type {IModule} from "@/modules/IModule.ts";
import type {TSendGift} from "@/stores/Ecosystem/Types/TSendGift.ts";

export interface INotificationsProvider extends IModule{
    setNotificationsInitialized():void;
    addNotification(notification: TNotification):void;
    removeNotification(key:string):void;
    addPopup(key:string, componentName: string, ppData: TPopupData):void;
    removePopup(key:string):void;
    setNotificationShown(key:string):void;
    addBigGift(key:string, gift: TSendGift):void;
}