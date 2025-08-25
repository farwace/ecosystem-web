import type {IPlatformEvents} from "@/modules/EventsModule/Interfaces/IPlatformEvents";
import type {ReceiveDataMap, VKBridgeEvent} from "@vkontakte/vk-bridge";
import {Subject} from "rxjs";
import type {Store} from "pinia";
import type {IEcosystemStore} from "@/stores/Ecosystem/IEcosystemStore";
import {ecosystemStore} from "@/stores/Ecosystem/ecosystemStore";
import bridge from '@vkontakte/vk-bridge';
import {Console} from "@/classes/utils/Console";
import {calculateAge} from "@/classes/utils/CalculateAge";
import {getAgeGroup} from "@/classes/utils/GetAgeGroup";
import type {App} from "vue";
import {inject, injectable} from "inversify";
import {NotificationsSymbol} from "@/modules/NotificationsModule/symbols.ts";
import type {INotificationsProvider} from "@/modules/NotificationsModule/Interfaces/INotificationsProvider.ts";
import type {TShopSubscription} from "@/modules/ApiModule/Types/TShopSubscription.ts";
import type {TShopCoin} from "@/modules/ApiModule/Types/TShopCoin.ts";
import {themeStore} from "@/stores/Theme/themeStore.ts";
import type {IThemeStore} from "@/stores/Theme/IThemeStore.ts";

@injectable()
export class BridgeEventsProvider implements IPlatformEvents {
    private _bridgeEvent$ = new Subject<VKBridgeEvent<keyof ReceiveDataMap>>();
    private ecosystemStore: Store<'ecosystem', IEcosystemStore>
    private themeStore: Store<'theme', IThemeStore>
    private arLaunchParams: any = undefined;
    constructor(
        @inject(NotificationsSymbol)
        private notificationsProvider: INotificationsProvider
    ) {
        bridge.subscribe((event) => {
            this._bridgeEvent$.next(event);
        });
        this.ecosystemStore = ecosystemStore();
        this.arLaunchParams = window?.location?.search?.slice?.(1)?.split?.('&')?.map?.(e => e?.split?.('='));
    }

    install(app: App, symbol: symbol) {
        app.provide(symbol, this);
    }

    async init(){
        await this.queryLaunchParams().then(() => {
            this.ecosystemStore.$patch({
                authString: `Bearer ${window.location.search.slice(1)}`
            });
        });
    }

    getEmitter():Subject<VKBridgeEvent<keyof ReceiveDataMap>>{
        return this._bridgeEvent$;
    }

    async queryLaunchParams(){
        /*@ts-ignore*/
        if(this?.arLaunchParams?.filter?.(p => p?.[0] === 'vk_app_id')?.[0]?.[1] != import.meta.env.VITE_VK_APP_ID){
            this.notificationsProvider.addPopup('laucnh-error', 'simple-popup', {
                noClose: true,
                darkBg: true,
                backdropBlur: true,
                title: 'Ошибка инициализации приложения!',
                message: 'Неизвестная точка запуска. <br/><a href="https://vk.com/app'+import.meta.env.VITE_VK_APP_ID+'">Нажмите для перехода в интерфейс <b>ВКконтакте</b></a>',
                modal: true,
            })
        }

        try {
            const launchParams = await bridge.send('VKWebAppGetLaunchParams');
            if(launchParams.vk_app_id && launchParams.vk_app_id == import.meta.env.VITE_VK_APP_ID){
                const userInfo = await bridge.send('VKWebAppGetUserInfo', {user_id: launchParams.vk_user_id});

                const sex = userInfo.sex || 2;
                const ageGroup = getAgeGroup(calculateAge(userInfo.bdate));

                this.ecosystemStore.$patch({
                    launchParams: launchParams,
                    firstName: userInfo.first_name,
                    lastName: userInfo.last_name,
                    avatar: userInfo.photo_100,
                    avatarBig: userInfo.photo_max_orig,
                    sex: sex,
                    ageGroup: ageGroup,
                    socialId: launchParams.vk_user_id,
                });
            }

            if(launchParams.vk_platform == 'mobile_iphone' || launchParams?.vk_platform == 'mobile_ipad' || launchParams?.vk_platform == 'mobile_iphone_messenger'){
                try {
                    await bridge.send('VKWebAppSetSwipeSettings', {
                        history: true
                    });
                    this.themeStore.$patch({
                        customSwipeSettings: true
                    })
                }
                catch (e: any){}
            }
            if(['desktop_web', 'desktop_app_messenger', 'desktop_web_messenger', 'web_external'].indexOf(launchParams.vk_platform) > -1){
                document.documentElement.setAttribute('desktop' , '1');
            }



        }
        catch (e) {
            Console.log('<<<>>> Launch Params Error <<<>>>');
        }
    }

    setApplicationLoadError = async () => {
        this.notificationsProvider.addPopup('load-error', 'simple-popup', {
            noClose: true,
            noCloseButton: true,
            title: 'Ошибка запуска',
            subtitle: 'Не удалось инициализировать запуск',
            message: 'Возможно, ведутся технические работы. Попробуйте еще раз или зайдите позже',
            backdropBlur: true,
            darkBg: true
        })
        return this.setApplicationIsReady();
    }
    setApplicationIsReady = async () => {
        return bridge.send('VKWebAppInit');
    }

    buySubscription = async (subscription: TShopSubscription) => {
        try {
            const res = await bridge.send('VKWebAppShowSubscriptionBox', {
                action: 'create',
                item: subscription.code,
            });

            if(res.success){
                this.notificationsProvider.addNotification({
                    type: 'success',
                    message: "Спасибо за совершение покупки!"
                })
            }
        }
        catch (e: any){
            this.notificationsProvider.addNotification({
                type: 'error',
                message: "Не удалось оформить подписку"
            })
        }
    }

    buyMoney = async (item: TShopCoin) => {
        try{
            const res = await bridge.send('VKWebAppShowOrderBox', {
                type: 'item',
                item: item.code
            });

            if(res.status == 'fail'){
                this.notificationsProvider.addNotification({
                   type: 'error',
                   message: "Не удалось совершить покупку"
                })
            }

            if(res.status == 'success'){
                this.notificationsProvider.addNotification({
                    type: 'success',
                    message: "Спасибо за совершение покупки!"
                })
            }
        }
        catch (e: any){
            this.notificationsProvider.addNotification({
                type: 'error',
                message: "Не удалось совершить покупку"
            })
        }
    }
}