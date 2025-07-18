import {type App, inject} from "vue"
import {createPinia} from "pinia";
import Vue3Lottie from 'vue3-lottie'
import {StubEventsProvider} from "@/modules/EventsModule/Providers/StubEventsProvider.ts";
import {BridgeEventsProvider} from "@/modules/EventsModule/Providers/BridgeEventsProvider.ts";
import {EventsModule} from "@/modules/EventsModule";
import type {IPlatformEvents} from "@/modules/EventsModule/Interfaces/IPlatformEvents.ts";
import {PlatformEventsSymbol} from "@/modules/EventsModule/symbols.ts";

export const AppBuilder = () => {
    return {
        build: ($app: App) => {
            $app.use(createPinia());
            $app.use(Vue3Lottie, {name: 'Vue3Lottie'});

            const bridgeEvents = import.meta.env.VITE_ENVELOP === 'development' ?
                new StubEventsProvider() :
                new BridgeEventsProvider();


            $app.use(
                new EventsModule(
                    bridgeEvents
                )
            );
            // $app.use(new NotificationsModule());
            // $app.use(new ApiModule());
        }
    }
}