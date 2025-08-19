import type {TShopCoin} from "@/modules/ApiModule/Types/TShopCoin.ts";
import type {TShopSubscription} from "@/modules/ApiModule/Types/TShopSubscription.ts";

export type TShopResponse = {
    canUseTrialSubscription: boolean,
    coins: TShopCoin[],
    subscriptions: TShopSubscription[]
}