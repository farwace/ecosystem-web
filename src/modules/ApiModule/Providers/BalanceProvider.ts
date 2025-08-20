import {ApiProvider} from "@/modules/ApiModule/Providers/ApiProvider.ts";
import {inject, injectable} from "inversify";
import {NotificationsSymbol} from "@/modules/NotificationsModule/symbols.ts";
import type {INotificationsProvider} from "@/modules/NotificationsModule/Interfaces/INotificationsProvider.ts";
import type {IBalanceProvider} from "@/modules/ApiModule/Interfaces/IBalanceProvider.ts";
import type {TShopResponse} from "@/modules/ApiModule/Types/TShopResponse.ts";

@injectable()
export class BalanceProvider extends ApiProvider implements IBalanceProvider{

    constructor(
        @inject(NotificationsSymbol)
        private notificationsProvider: INotificationsProvider
    ) {
        super();
    }

    openDonutPopup() {
        this.notificationsProvider?.addPopup('buy-money', 'shop-popup', {
            modal: true,
            darkBg: true,
            noTitle: true,
            noPaddings: true,
        })
    }

    getShopItems = async (): Promise<TShopResponse | undefined> => {
        if(!this.achievementsStore.$state.shopCoins){
            const shop = (await this.fetch(`${this.getApiEndpoint()}/shop/items`))?.data as TShopResponse;
            this.achievementsStore.$patch({
                canUseTrialSubscription: shop.canUseTrialSubscription,
                shopCoins: shop.coins,
                shopSubscription: shop.subscriptions
            });
            return shop;
        }
        return {
            canUseTrialSubscription: this.achievementsStore.$state.canUseTrialSubscription || false,
            coins: this.achievementsStore.$state.shopCoins || [],
            subscriptions: this.achievementsStore.$state.shopSubscription || []
        }
    }
}