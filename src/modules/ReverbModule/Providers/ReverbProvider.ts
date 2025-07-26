import type {IReverbProvider} from "@/modules/ReverbModule/Interfaces/IReverbProvider.ts";
import type {App} from "vue";
import {injectable} from "inversify";
import type {Store} from "pinia";
import type {IEcosystemStore} from "@/stores/Ecosystem/IEcosystemStore.ts";
import {ecosystemStore} from "@/stores/Ecosystem/ecosystemStore";
import {Subject} from "rxjs";
import type {TReverbMessage} from "@/modules/ReverbModule/Types/TReverbMessage.ts";
import Pusher from "pusher-js";
import Echo from "laravel-echo";

declare global {
    interface Window {
        Pusher?: typeof Pusher;
    }
}

@injectable()
export class ReverbProvider implements IReverbProvider{

    private readonly ecosystemStore: Store<'ecosystem', IEcosystemStore>;
    private readonly _reverbObserver$: Subject<TReverbMessage<unknown>>;

    constructor() {
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

        echo.private(`user.${this.ecosystemStore.$state.id}`)
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