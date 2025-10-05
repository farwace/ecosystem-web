import {Subject} from "rxjs";
import type {ReceiveDataMap, VKBridgeEvent} from "@vkontakte/vk-bridge";
import type {IModule} from "@/modules/IModule.ts";
import type {TShopSubscription} from "@/modules/ApiModule/Types/TShopSubscription.ts";
import type {TShopCoin} from "@/modules/ApiModule/Types/TShopCoin.ts";
import type {RequestPropsMap} from "@vkontakte/vk-bridge/dist/types/src/types/data";
import type {TGetShareImageResponse} from "@/modules/ApiModule/Types/TGetShareImageResponse.ts";

export interface IPlatformEvents extends IModule{
    init: () => Promise<void>;
    getEmitter: () => Subject<VKBridgeEvent<keyof ReceiveDataMap>>;
    getAdsEmitter: () => Subject<any>;
    setApplicationIsReady: () => Promise<any>;
    setApplicationLoadError: () => Promise<any>;
    buySubscription: (s: TShopSubscription) => Promise<any>;
    buyMoney: (s: TShopCoin) => Promise<any>;
    getAuthToken: (s: RequestPropsMap["VKWebAppGetAuthToken"]) => Promise<any>;
    isDesktop: () => boolean;
    inviteFriendToGame: (roomId: string, gameCode: string) => Promise<any>;
    displayBottomBn: () => void;
    removeBottomBn: () => void;
    checkRewardNativeAdds: () => void;
    allowNotifications: () => void;
    showRewardAdds: () => Promise<boolean>;
    finishRewardAdds: () => void;
    startRewardAdds: (rqkey: string) => void;
    showStoryBox: (data: TGetShareImageResponse) => Promise<any>;
}