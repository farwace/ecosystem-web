import {ApiProvider} from "@/modules/ApiModule/Providers/ApiProvider.ts";
import {inject, injectable} from "inversify";
import {NotificationsSymbol} from "@/modules/NotificationsModule/symbols.ts";
import type {INotificationsProvider} from "@/modules/NotificationsModule/Interfaces/INotificationsProvider.ts";
import type {IBalanceProvider} from "@/modules/ApiModule/Interfaces/IBalanceProvider.ts";

@injectable()
export class BalanceProvider extends ApiProvider implements IBalanceProvider{

    constructor(
        @inject(NotificationsSymbol)
        private notificationsProvider: INotificationsProvider
    ) {
        super();
    }

    openDonutPopup() {
        this.notificationsProvider?.addPopup('buy-money', 'simple-popup', {
            modal: true,
            darkBg: true,
            title: "Покупка монет",
            message: 'TODO: Модальное окно покупки монет'
        })
    }
}