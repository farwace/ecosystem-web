import {Subject} from "rxjs";
import type {ReceiveDataMap, VKBridgeEvent} from "@vkontakte/vk-bridge";
import type {IModule} from "@/modules/IModule.ts";
import type {TShopSubscription} from "@/modules/ApiModule/Types/TShopSubscription.ts";
import type {TShopCoin} from "@/modules/ApiModule/Types/TShopCoin.ts";
import type {RequestPropsMap} from "@vkontakte/vk-bridge/dist/types/src/types/data";

export interface IPlatformEvents extends IModule{
    init: () => Promise<void>;
    getEmitter: () => Subject<VKBridgeEvent<keyof ReceiveDataMap>>;
    setApplicationIsReady: () => Promise<any>;
    setApplicationLoadError: () => Promise<any>;
    buySubscription: (s: TShopSubscription) => Promise<any>;
    buyMoney: (s: TShopCoin) => Promise<any>;
    getAuthToken: (s: RequestPropsMap["VKWebAppGetAuthToken"]) => Promise<any>;
}