import type {IModule} from "@/modules/IModule.ts";
import type {TGift} from "@/stores/Ecosystem/Types/TGift.ts";
import type {TResponse} from "@/modules/ApiModule/Types/TResponse.ts";
import type {TSendGiftResponse} from "@/modules/ApiModule/Types/TSendGiftResponse.ts";
import type {Subject} from "rxjs";

export interface IGiftsProvider  extends IModule{
    getGiftList():Promise<TGift[]>;
    openGiftsPopup(id: number | string, avatar?: string):void;
    sendGift(userId: number | string, giftId: number, count: number): Promise<TResponse<TSendGiftResponse>>;
    getEmitter$(): Subject<TSendGiftResponse>;
}