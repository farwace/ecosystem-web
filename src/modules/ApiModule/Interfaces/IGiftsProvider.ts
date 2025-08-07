import type {IModule} from "@/modules/IModule.ts";
import type {TGift} from "@/stores/Ecosystem/Types/TGift.ts";

export interface IGiftsProvider  extends IModule{
    getGiftList():Promise<TGift[]>;
    openGiftsPopup(id: number | string, avatar?: string):void;
}