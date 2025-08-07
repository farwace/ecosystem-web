import {ApiProvider} from "@/modules/ApiModule/Providers/ApiProvider.ts";
import {inject, injectable} from "inversify";
import type {IGiftsProvider} from "@/modules/ApiModule/Interfaces/IGiftsProvider.ts";
import type {TGift} from "@/stores/Ecosystem/Types/TGift.ts";
import type {TResponse} from "@/modules/ApiModule/Types/TResponse.ts";
import {NotificationsSymbol} from "@/modules/NotificationsModule/symbols.ts";
import type {INotificationsProvider} from "@/modules/NotificationsModule/Interfaces/INotificationsProvider.ts";

@injectable()
export class GiftsProvider extends ApiProvider implements IGiftsProvider{

    constructor(
        @inject(NotificationsSymbol)
        private notificationProvider: INotificationsProvider
    ) {
        super();
    }
    getGiftList = async () => {
        if(this.ecosystemStore.$state.giftList?.length || 0 > 0){
            return this.ecosystemStore.$state.giftList;
        }

        const gifts = await this.fetch(`${this.getApiEndpoint()}/gifts/get`) as unknown as TResponse<TGift[]>;
        this.ecosystemStore.$patch({
            giftList: gifts.data,
        });

        return gifts.data;
    }

    openGiftsPopup(id: number | string, avatar?: string) {
        this.notificationProvider?.addPopup?.('send-gift', 'send-gift-popup', {
            darkBg: true,
            userId: id,
            title: 'Отправить подарок' + (avatar ? ` <img class="rounded-small-avatar" src="${avatar}" />` : ''),
        })
    }
}