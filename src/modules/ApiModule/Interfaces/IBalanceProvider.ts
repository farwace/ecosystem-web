import type {IModule} from "@/modules/IModule.ts";
import type {TShopResponse} from "@/modules/ApiModule/Types/TShopResponse.ts";

export interface IBalanceProvider extends IModule{
    openDonutPopup():void;
    getShopItems():Promise<TShopResponse | undefined>
}