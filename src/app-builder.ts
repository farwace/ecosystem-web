import type {App} from "vue"
import {createPinia} from "pinia";
import Vue3Lottie from 'vue3-lottie'
import {StubEventsProvider} from "@/modules/EventsModule/Providers/StubEventsProvider.ts";
import {BridgeEventsProvider} from "@/modules/EventsModule/Providers/BridgeEventsProvider.ts";
import type {IPlatformEvents} from "@/modules/EventsModule/Interfaces/IPlatformEvents.ts";
import {PlatformEventsSymbol} from "@/modules/EventsModule/symbols.ts";
import {Container} from "inversify";
import type {IUserProvider} from "@/modules/ApiModule/Interfaces/IUserProvider.ts";
import {UserProviderSymbol} from "@/modules/ApiModule/symbols.ts";
import {UserProvider} from "@/modules/ApiModule/Providers/UserProvider.ts";
import type {INotificationsProvider} from "@/modules/NotificationsModule/Interfaces/INotificationsProvider.ts";
import {NotificationsSymbol} from "@/modules/NotificationsModule/symbols.ts";
import {NotificationsProvider} from "@/modules/NotificationsModule/Providers/NotificationsProvider.ts";

export const AppBuilder = () => {
    return {
        build: async ($app: App) => {
            $app.use(createPinia());
            $app.use(Vue3Lottie, {name: 'Vue3Lottie'});

            const container = new Container();

            import.meta.env.VITE_ENVELOP === 'development' ?
                container.bind<IPlatformEvents>(PlatformEventsSymbol).to(StubEventsProvider).inSingletonScope() :
                container.bind<IPlatformEvents>(PlatformEventsSymbol).to(BridgeEventsProvider).inSingletonScope();
            const bridgeEventsProvider = container.get<IPlatformEvents>(PlatformEventsSymbol);
            bridgeEventsProvider.install($app, PlatformEventsSymbol);

            container.bind<IUserProvider>(UserProviderSymbol).to(UserProvider).inSingletonScope();
            const userProvider = container.get<IUserProvider>(UserProviderSymbol);
            userProvider.install($app, UserProviderSymbol);

            container.bind<INotificationsProvider>(NotificationsSymbol).to(NotificationsProvider).inSingletonScope();
            const notificationsProvider = container.get<INotificationsProvider>(NotificationsSymbol);
            notificationsProvider.install($app, NotificationsSymbol);

            await bridgeEventsProvider.init();
            await userProvider.getUserInfo();
            await bridgeEventsProvider.setApplicationIsReady();
        }
    }
}