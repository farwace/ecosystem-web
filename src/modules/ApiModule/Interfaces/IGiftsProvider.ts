import type {IModule} from "@/modules/IModule.ts";
import type {TGift} from "@/stores/Ecosystem/Types/TGift.ts";
import type {TResponse} from "@/modules/ApiModule/Types/TResponse.ts";

export interface IGiftsProvider  extends IModule{
    getGiftList():Promise<TGift[]>;
    openGiftsPopup(id: number | string, avatar?: string):void;
    sendGift(userId: number | string, giftId: number, count: number): Promise<TResponse<boolean>>;
}