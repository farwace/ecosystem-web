import type {IModule} from "@/modules/IModule.ts";

export interface IBalanceProvider extends IModule{
    openDonutPopup():void;
}