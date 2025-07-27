import type {IReverbProvider} from "@/modules/ReverbModule/Interfaces/IReverbProvider.ts";
import {type App} from "vue";
import {injectable, inject} from "inversify";
import type {Store} from "pinia";
import type {IEcosystemStore} from "@/stores/Ecosystem/IEcosystemStore.ts";
import {ecosystemStore} from "@/stores/Ecosystem/ecosystemStore";
import {Subject} from "rxjs";
import type {TReverbMessage} from "@/modules/ReverbModule/Types/TReverbMessage.ts";
import Pusher from "pusher-js";
import Echo from "laravel-echo";
import {Console} from "@/classes/utils/Console.ts";
import {UserProviderSymbol} from "@/modules/ApiModule/symbols.ts";
import type {IUserProvider} from "@/modules/ApiModule/Interfaces/IUserProvider.ts";

declare global {
    interface Window {
        Pusher?: typeof Pusher;
    }
}

@injectable()
export class ReverbProvider implements IReverbProvider{

    private readonly ecosystemStore: Store<'ecosystem', IEcosystemStore>;
    private readonly _reverbObserver$: Subject<TReverbMessage<unknown>>;

    constructor(
        @inject(UserProviderSymbol)
        private userProvider: IUserProvider,
    ) {
        this.ecosystemStore = ecosystemStore();
        this._reverbObserver$ = new Subject();
        window.Pusher = Pusher;

        if(import.meta.env.VITE_ENVELOP === 'development'){
            Pusher.logToConsole = true;
        }
    }

    install(app: App, symbol: symbol) {
        app.provide(symbol, this);

        const echo = new Echo({
            broadcaster: 'reverb',
            key: import.meta.env.VITE_REVERB_APP_KEY,
            wsHost: import.meta.env.VITE_REVERB_HOST,
            wsPort: Number(import.meta.env.VITE_REVERB_PORT),
            forceTLS: import.meta.env.VITE_REVERB_TLS === 'true',
            disableStats: true,
            enabledTransports: ['ws', 'wss'],
            auth:{
                headers: {
                    'X-CSRF-TOKEN': document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') || '',
                    'Accept': 'application/json',
                    'Authorization': this.ecosystemStore.$state.authString,
                }
            },
            authEndpoint: import.meta.env.VITE_REVERB_APP_AUTH_ENDPOINT,

        });

        const privateChannel = echo.private(`user.${this.ecosystemStore.$state.id}`);

        privateChannel
            .subscribed(async () => {
                try{
                    const missedEvents = await this.userProvider.loadMissedEvents();
                    missedEvents.data.forEach((event: TReverbMessage<unknown>) => {
                        this._reverbObserver$.next(event);
                    })
                }
                catch (e:any){}

            })
            .error((error: any) => {
                Console.error('>>> Ошибка подписки на приватный канал:', error);
            })
            .listen('.UserSocketMessage', (p: TReverbMessage<unknown>) => {
                this._reverbObserver$.next(p);
            });

        echo.channel('general')
            .listen('.public', (p: TReverbMessage<unknown>) => {
                this._reverbObserver$.next(p);
            });
    }

    getReverbObserver$(){
        return this._reverbObserver$;
    }


}