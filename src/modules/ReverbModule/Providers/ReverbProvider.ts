import type {IReverbProvider} from "@/modules/ReverbModule/Interfaces/IReverbProvider.ts";
import {type App} from "vue";
import {injectable, inject} from "inversify";
import type {Store} from "pinia";
import type {IEcosystemStore} from "@/stores/Ecosystem/IEcosystemStore.ts";
import {ecosystemStore} from "@/stores/Ecosystem/ecosystemStore";
import {Subject} from "rxjs";
import type {TReverbMessage} from "@/modules/ReverbModule/Types/TReverbMessage.ts";
import Pusher from "pusher-js";
import Echo, {type Broadcaster} from "laravel-echo";
import {Console} from "@/classes/utils/Console.ts";
import {UserProviderSymbol} from "@/modules/ApiModule/symbols.ts";
import type {IUserProvider} from "@/modules/ApiModule/Interfaces/IUserProvider.ts";
import {NotificationsSymbol} from "@/modules/NotificationsModule/symbols.ts";
import type {INotificationsProvider} from "@/modules/NotificationsModule/Interfaces/INotificationsProvider.ts";
import {isWeb} from '@/platform/launch';
import {requestConnectionTicket, webRequest} from '@/auth/web-session';

declare global {
    interface Window {
        Pusher?: typeof Pusher;
    }
}

@injectable()
export class ReverbProvider implements IReverbProvider{

    private readonly ecosystemStore: Store<'ecosystem', IEcosystemStore>;
    private readonly _reverbObserver$: Subject<TReverbMessage<unknown>>;
    private privateChannel: any;
    private echo: Echo<keyof Broadcaster> | undefined;
    private _heartBeatInterval: any;
    private webTicket = '';
    private ticketExpires = 0;
    private ticketRequest?: Promise<string>;

    private async connectionTicket(): Promise<string> {
        if (this.webTicket && Date.now() < this.ticketExpires) return this.webTicket;
        if (!this.ticketRequest) {
            this.ticketRequest = requestConnectionTicket('reverb').then(ticket => {
                this.webTicket = ticket;
                this.ticketExpires = Date.now() + 180_000;
                return ticket;
            }).finally(() => { this.ticketRequest = undefined; });
        }
        return this.ticketRequest;
    }

    constructor(
        @inject(UserProviderSymbol)
        private userProvider: IUserProvider,
        @inject(NotificationsSymbol)
        private notificationsProvider: INotificationsProvider
    ) {
        this.ecosystemStore = ecosystemStore();
        this._reverbObserver$ = new Subject();
        window.Pusher = Pusher;

        if(['development', 'preprod'].indexOf(import.meta.env.VITE_ENVELOP) > -1){
            Pusher.logToConsole = true;
        }
    }

    private getAuthData = async (): Promise<{[key: string]: string | number}> => {
        return {
            user_id: this.ecosystemStore.$state.id,
            auth: isWeb ? await this.connectionTicket() : this.ecosystemStore.$state.authString,
        }
    }

    install(app: App, symbol: symbol) {
        app.provide(symbol, this);
    }

    async createConnection(){
        if (isWeb) await this.connectionTicket();
        this.echo = new Echo({
            broadcaster: 'reverb',
            key: import.meta.env.VITE_REVERB_APP_KEY,
            wsHost: import.meta.env.VITE_REVERB_HOST,
            wsPort: Number(import.meta.env.VITE_REVERB_PORT),
            forceTLS: import.meta.env.VITE_REVERB_TLS === 'true',
            disableStats: true,
            enabledTransports: import.meta.env.VITE_REVERB_TLS === 'true' ? ['wss'] : ['ws'],
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
            ...(isWeb ? {
                authorizer: (channel: {name: string}) => ({
                    authorize: (socketId: string, callback: (error: Error | null, data: any) => void) => {
                        webRequest('/broadcasting/auth', {
                            method: 'POST', body: JSON.stringify({socket_id: socketId, channel_name: channel.name}),
                        }).then(data => callback(null, data)).catch(error => callback(error, null));
                    },
                }),
            } : {}),

        });

        if(import.meta.env.VITE_ENVELOP != 'development'){
            const connector = (this.echo?.connector as any)?.pusher?.connection;
            if(connector){
                connector.bind('state_change', ({current}: { current: string }) => {
                    if(current === 'failed' || current === 'unavailable'){
                        this.notificationsProvider.addPopup('connection-error', 'simple-popup', {
                            modal: true,
                            darkBg: true,
                            noClose: true,
                            noCloseButton: true,
                            title: 'Потеряно соединение с сервером',
                            message: 'Соединение будет восстановлено автоматически.<br/><br/>Если ничего не происходит',
                            action: 'reload',
                            actionLabel: 'Восстановить соединение',

                        });
                    }
                    if(current === 'connected'){
                        this.notificationsProvider.removePopup('connection-error');
                    }
                });
                connector.bind('error', (error: any) => {
                    Console.error('>>> Reverb Connector error:', error);
                });
            }
        }


        this.privateChannel = this.echo.private(`user.${this.ecosystemStore.$state.id}`);

        this.privateChannel
            .subscribed(async () => {
                try{
                    this.privateChannel.whisper('missed-events', await this.getAuthData());

                    const pusherConn = (this.echo?.connector as any)?.pusher?.connection;
                    this.ecosystemStore.$patch({
                        connectionId: pusherConn.socket_id
                    });
                    pusherConn.bind('state_change', (states: { previous: string; current: string }) => {
                        if(states.current === 'connecting'){ //todo: Переделать работу с addNotification - невозможно программно убрать надпись если timeout => false
                            this.notificationsProvider.addNotification({
                                key: 'connection-error',
                                message: 'Потеряно соединение с сервером...',
                                type: "warning",
                            })
                        }
                        if(states.current === 'connected'){
                            this.notificationsProvider.removeNotification('connection-error');
                        }
                    });
                }
                catch (e:any){}

            })
            .error((error: any) => {
                Console.error('>>> Ошибка подписки на приватный канал:', error);
            })
            .listen('.UserSocketMessage', (p: TReverbMessage<unknown>) => {
                this._reverbObserver$.next(p);
            });

        this.echo.channel('general')
            .listen('.public', (p: TReverbMessage<unknown>) => {
                this._reverbObserver$.next(p);
            });

        this._heartBeatInterval = setInterval(() => { void this.sendMessage('heartbeat', {}); }, 30_000);

    }

    async sendMessage(event: string, data: {[key: string]: any}) {
        try {
            Console.log('>>> SEND MESSAGE TO REVERB BEFORE');
            const dataToSend = Object.assign({}, data, await this.getAuthData())
            this.privateChannel.whisper(event, dataToSend);
            Console.log('>>> SEND MESSAGE TO REVERB AFTER');
        }
        catch (e){
            Console.log('>>> SEND MESSAGE TO REVERB CATCH', e);
        }
    }

    getReverbObserver$(){
        return this._reverbObserver$;
    }

    closeConnections(){
        if(this._heartBeatInterval){
            clearInterval(this._heartBeatInterval);
        }
        this.echo?.leaveAllChannels();
        this.echo?.disconnect();
    }

    onCloseApp() {
        //todo: вызывать метод по событию VKWebAppCloseResult из bridge!
        void this.sendMessage('close', {});
    }

}
