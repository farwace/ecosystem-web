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

export const AppBuilder = () => {
    return {
        build: async ($app: App) => {
            $app.use(createPinia());
            $app.use(Vue3Lottie, {name: 'Vue3Lottie'});

            const container = new Container();

            import.meta.env.VITE_ENVELOP === 'development' ?
                container.bind<IPlatformEvents>(PlatformEventsSymbol).to(StubEventsProvider).inSingletonScope() :
                container.bind<IPlatformEvents>(PlatformEventsSymbol).to(BridgeEventsProvider).inSingletonScope();

            container.bind<IUserProvider>(UserProviderSymbol).to(UserProvider).inSingletonScope();

            const bridgeEventsProvider = container.get<IPlatformEvents>(PlatformEventsSymbol);
            const userProvider = container.get<IUserProvider>(UserProviderSymbol);

            bridgeEventsProvider.install($app, PlatformEventsSymbol);
            userProvider.install($app, UserProviderSymbol);

        }
    }
}