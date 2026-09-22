import type {App} from "vue"
import {createPinia} from "pinia";
import {StubEventsProvider} from "@/modules/EventsModule/Providers/StubEventsProvider.ts";
import {BridgeEventsProvider} from "@/modules/EventsModule/Providers/BridgeEventsProvider.ts";
import type {IPlatformEvents} from "@/modules/EventsModule/Interfaces/IPlatformEvents.ts";
import {EcosystemSymbol, PlatformEventsSymbol} from "@/modules/EventsModule/symbols.ts";
import {Container} from "inversify";
import type {IUserProvider} from "@/modules/ApiModule/Interfaces/IUserProvider.ts";
import {
    BalanceProviderSymbol,
    GameApiProviderSymbol,
    GiftsProviderSymbol,
    UserProviderSymbol
} from "@/modules/ApiModule/symbols.ts";
import {UserProvider} from "@/modules/ApiModule/Providers/UserProvider.ts";
import type {INotificationsProvider} from "@/modules/NotificationsModule/Interfaces/INotificationsProvider.ts";
import {NotificationsSymbol} from "@/modules/NotificationsModule/symbols.ts";
import {NotificationsProvider} from "@/modules/NotificationsModule/Providers/NotificationsProvider.ts";
import {ReverbSymbol} from "@/modules/ReverbModule/symbols.ts";
import type {IReverbProvider} from "@/modules/ReverbModule/Interfaces/IReverbProvider.ts";
import {ReverbProvider} from "@/modules/ReverbModule/Providers/ReverbProvider.ts";
import {Console} from "@/classes/utils/Console.ts";
import {EcosystemProvider} from "@/modules/EventsModule/Providers/EcosystemProvider.ts";
import type {IEcosystemProvider} from "@/modules/EventsModule/Interfaces/IEcosystemProvider.ts";
import type {IGiftsProvider} from "@/modules/ApiModule/Interfaces/IGiftsProvider.ts";
import {GiftsProvider} from "@/modules/ApiModule/Providers/GiftsProvider.ts";
import type {IBalanceProvider} from "@/modules/ApiModule/Interfaces/IBalanceProvider.ts";
import {BalanceProvider} from "@/modules/ApiModule/Providers/BalanceProvider.ts";
import {GameProviderSymbol} from "@/modules/GameModule/symbols.ts";
import {GameProvider} from "@/modules/GameModule/Providers/GameProvider.ts";
import type {IGameProvider} from "@/modules/GameModule/Interfaces/IGameProvider.ts";
import type {IGameApiProvider} from "@/modules/ApiModule/Interfaces/IGameApiProvider.ts";
import {GameApiProvider} from "@/modules/ApiModule/Providers/GameApiProvider.ts";
import {MetrikaSymbol} from "@/modules/MetrikaModule/symbols.ts";
import type {IMetrikaProvider} from "@/modules/MetrikaModule/Interfaces/IMetrikaProvider.ts";
import {MetrikaProvider} from "@/modules/MetrikaModule/Providers/MetrikaProvider.ts";
import {WebEventsProvider} from '@/modules/EventsModule/Providers/WebEventsProvider';
import {isWeb} from '@/platform/launch';
import {applicationState, loadWebSession} from '@/auth/web-session';
import {ecosystemStore} from '@/stores/Ecosystem/ecosystemStore';

export const AppBuilder = () => {
    return {
        build: async ($app: App) => {
            $app.use(createPinia());

            const container = new Container();

            container.bind<IMetrikaProvider>(MetrikaSymbol).to(MetrikaProvider).inSingletonScope();
            const metrikaProvider = container.get<IMetrikaProvider>(MetrikaSymbol);
            metrikaProvider.install($app, MetrikaSymbol);

            container.bind<INotificationsProvider>(NotificationsSymbol).to(NotificationsProvider).inSingletonScope();
            isWeb ?
                container.bind<IPlatformEvents>(PlatformEventsSymbol).to(WebEventsProvider).inSingletonScope() :
            import.meta.env.DEV && import.meta.env.VITE_ENVELOP === 'development' ?
                container.bind<IPlatformEvents>(PlatformEventsSymbol).to(StubEventsProvider).inSingletonScope() :
                container.bind<IPlatformEvents>(PlatformEventsSymbol).to(BridgeEventsProvider).inSingletonScope();
            const bridgeEventsProvider = container.get<IPlatformEvents>(PlatformEventsSymbol);
            bridgeEventsProvider.install($app, PlatformEventsSymbol);

            container.bind<IUserProvider>(UserProviderSymbol).to(UserProvider).inSingletonScope();
            const userProvider = container.get<IUserProvider>(UserProviderSymbol);
            userProvider.install($app, UserProviderSymbol);

            container.bind<IGameProvider>(GameProviderSymbol).to(GameProvider).inSingletonScope();
            const gameProvider = container.get<IGameProvider>(GameProviderSymbol);
            gameProvider.install($app, GameProviderSymbol);

            const notificationsProvider = container.get<INotificationsProvider>(NotificationsSymbol);
            notificationsProvider.install($app, NotificationsSymbol);

            container.bind<IGiftsProvider>(GiftsProviderSymbol).to(GiftsProvider).inSingletonScope();
            const giftsProvider = container.get<IGiftsProvider>(GiftsProviderSymbol);
            giftsProvider.install($app, GiftsProviderSymbol);

            container.bind<IGameApiProvider>(GameApiProviderSymbol).to(GameApiProvider).inSingletonScope();
            const gameApiProvider = container.get<IGameApiProvider>(GameApiProviderSymbol);
            gameApiProvider.install($app, GameApiProviderSymbol);

            container.bind<IBalanceProvider>(BalanceProviderSymbol).to(BalanceProvider).inSingletonScope();
            const balanceProvider = container.get<IBalanceProvider>(BalanceProviderSymbol);
            balanceProvider.install($app, BalanceProviderSymbol);

            container.bind<IReverbProvider>(ReverbSymbol).to(ReverbProvider).inSingletonScope();
            const reverbProvider = container.get<IReverbProvider>(ReverbSymbol);
            reverbProvider.install($app, ReverbSymbol);



            reverbProvider.getReverbObserver$().subscribe(reverb => {
                Console.log('>>> ', reverb);
            })

            container.bind<IEcosystemProvider>(EcosystemSymbol).to(EcosystemProvider).inSingletonScope();
            const ecosystemProvider = container.get<IEcosystemProvider>(EcosystemSymbol);
            ecosystemProvider.install($app, EcosystemSymbol);

            window.addEventListener('web-session-ended', () => reverbProvider.closeConnections());
            try {
                await bridgeEventsProvider.init();
                if (isWeb) {
                    const user = await loadWebSession();
                    if (!user?.verified || new URLSearchParams(location.search).get('auth') === 'reset') return;
                }
                await userProvider.getUserInfo();
                if (!ecosystemStore().id) throw new Error('Не удалось загрузить профиль.');
                await reverbProvider.createConnection();
                applicationState.ready = true;
            } catch (error) {
                applicationState.error = error instanceof Error ? error.message : 'Ошибка запуска приложения.';
            } finally {
                applicationState.checking = false;
            }

        }
    }
}
