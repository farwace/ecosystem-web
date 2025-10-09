import type {IPlatformEvents} from "@/modules/EventsModule/Interfaces/IPlatformEvents";
import bridge, {
    BannerAdLayoutType,
    BannerAdLocation,
    EAdsFormats,
    type ReceiveDataMap,
    type RequestPropsMap,
    type VKBridgeEvent
} from "@vkontakte/vk-bridge";

import {Subject} from "rxjs";
import type {Store} from "pinia";
import type {IEcosystemStore} from "@/stores/Ecosystem/IEcosystemStore";
import {ecosystemStore} from "@/stores/Ecosystem/ecosystemStore";
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
import type {TGetShareImageResponse} from "@/modules/ApiModule/Types/TGetShareImageResponse.ts";
import type {IBridgeStore} from "@/stores/Bridge/IBridgeStore.ts";
import {bridgeStore} from "@/stores/Bridge/bridgeStore.ts";

@injectable()
export class BridgeEventsProvider implements IPlatformEvents {
    private _bridgeEvent$ = new Subject<VKBridgeEvent<keyof ReceiveDataMap>>();
    private _nativeEcosystemEvent$ = new Subject();
    private ecosystemStore: Store<'ecosystem', IEcosystemStore>;
    private themeStore: Store<'theme', IThemeStore>;
    private bridgeStore: Store<'bridge', IBridgeStore>;
    private arLaunchParams: any = undefined;
    private _isDesktop = false;

    constructor(
        @inject(NotificationsSymbol)
        private notificationsProvider: INotificationsProvider
    ) {
        bridge.subscribe((event) => {
            this._bridgeEvent$.next(event);
        });
        this.ecosystemStore = ecosystemStore();
        this.themeStore = themeStore();
        this.bridgeStore = bridgeStore();
        this.arLaunchParams = window?.location?.search?.slice?.(1)?.split?.('&')?.map?.(e => e?.split?.('='));
    }

    install(app: App, symbol: symbol) {
        app.provide(symbol, this);
    }

    async init(){
        await this.queryLaunchParams();
        let AuthString = `Bearer ${window.location.search.slice(1)}`;
        const lp = this.ecosystemStore.$state.launchParams;
        if(lp){
            let launchString = '';
            Object.keys(lp).forEach((k) => {
                /* @ts-ignore */
                launchString += k + '=' + lp[k] + '&';
            });
            if(launchString.length > 1){
                launchString = launchString.slice(0, -1);
                AuthString = `Bearer ${launchString}`;
            }
        }

        this.ecosystemStore.$patch({
            authString: AuthString,
        });




        try {
            const res = await bridge.send('VKWebAppGetConfig');
            /*@ts-ignore*/
            if(['space_gray', 'vkcom_dark'].indexOf(res?.scheme) > -1){
                this.themeStore.$patch({
                    theme: 'dark'
                });
            }
            /*@ts-ignore*/
            if(['bright_light', 'vkcom_light'].indexOf(res?.scheme) > -1){
                this.themeStore.$patch({
                    theme: 'light'
                })
            }
        }
        catch (e: any){}
    }

    getEmitter():Subject<VKBridgeEvent<keyof ReceiveDataMap>>{
        return this._bridgeEvent$;
    }

    getEcosystemEmitter():Subject<any>{
        return this._nativeEcosystemEvent$;
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
                    platform: launchParams.vk_platform
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
                this._isDesktop = true;
            }
            this.loadClientVersion();

            //console.log('>>> LAUNCH PARAMS', launchParams);
            const recommended = (("vk_is_recommended" in launchParams) && launchParams?.vk_is_recommended == 1);
            const favorite = (("vk_is_favorite" in launchParams) && launchParams?.vk_is_favorite == 1);
            const notificationsEnabled = (("vk_are_notifications_enabled" in launchParams) && launchParams?.vk_are_notifications_enabled == 1);

            this.bridgeStore.$patch({
                inRecommended: recommended,
                inFavorites: favorite,
                notificationsEnabled: notificationsEnabled,
            });
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
        const authAccess = this.ecosystemStore.$state.authAccess;
        // if((authAccess?.requestedScope || []).indexOf('friends') < 0){
        //     this.notificationsProvider.addPopup('request-access-rules', 'request-access-popup', {
        //         modal: true,
        //         noCloseButton: true,
        //         noClose: true,
        //         noTitle: true,
        //         darkBg: true,
        //         backdropBlur: true,
        //         noPaddings: true,
        //     })
        // }

        bridge.send('VKWebAppStorageGet', {
            keys: [
                'OnBoardingBunkerShown'
            ]
        }).then((res) => {
            Console.log('>>> OnBoardingBunkerShown', res)
            res.keys.forEach(data => {
                if(data.key == 'OnBoardingBunkerShown' && data.value != '1'){
                    this._nativeEcosystemEvent$.next({
                        type: 'show-onboarding'
                    });

                    bridge.send('VKWebAppStorageSet', {
                        key: 'OnBoardingBunkerShown',
                        value:'1'
                    })
                }
            })
        });

        return bridge.send('VKWebAppInit');
    }

    loadClientVersion = () => {
        bridge.send('VKWebAppGetClientVersion').then((version ) => {
            const v = version as unknown as any;
            this.themeStore.$patch({
                clientInfo: {
                    version: v.version,
                    platform: v.platform,
                    app: v.app,
                }
            });
        });
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

    getAuthToken = async (data: RequestPropsMap["VKWebAppGetAuthToken"]) => {
        try {
            const res: any = await bridge.send('VKWebAppGetAuthToken', {
                scope: data.scope,
                /** @ts-ignore */
                app_id: parseInt(data.app_id.toString()),
            });
            if(res.access_token){
                this.bridgeStore.$patch({
                    accessToken: res.access_token,
                });
                if(res.scope.indexOf('friends') > -1){
                    this._nativeEcosystemEvent$.next({
                        type: 'should-query-update-friends',
                    });
                }
                return {
                    accessToken: res.access_token,
                    scope: res.scope,
                    expires: res?.expires || 0
                }
            }
        }
        catch (e: any) {
            return undefined;
        }
    }

    inviteFriendToGame = async (roomId: string, gameCode: string) => {
        const userId = this.ecosystemStore.$state.id;
        const obData: {[key: string]: string} = {
            link: import.meta.env.VITE_VK_APP_URL + '#user_id=' + userId + '---game='+ gameCode +'---room=' + roomId,
        }
        if(['mobile_android', 'mobile_ipad', 'mobile_iphone', 'mobile_android_messenger', 'mobile_iphone_messenger'].indexOf(this.ecosystemStore.$state.platform || '') > -1){
            obData['text'] = 'Заходи ко мне в ' + this.getGameNameByCode(gameCode) + '! Срочно нужен сокомандник!';
        }
        try {
            /**@ts-ignore*/
            await bridge.send('VKWebAppShare', obData)
        }
        catch (e: any) {}
    }


    isDesktop = () => {
        return this._isDesktop;
    }

    getGameNameByCode = (gameCode?: string) => {
        if(!gameCode) return 'игру';
        if(gameCode == 'bunker'){
            return 'Убежище'
        }
    }

    removeBottomBn = () => {
        bridge.send('VKWebAppHideBannerAd');
    }

    displayBottomBn = () => {
        if(!!this.ecosystemStore?.vip){
            return;
        }
        if(import.meta.env.VITE_ENVELOP == 'preprod'){
            return;
        }
        bridge.send('VKWebAppCheckBannerAd').then((data) => {
            if(data.result){

            }
            else{
                bridge.send('VKWebAppShowBannerAd', {
                    banner_location: BannerAdLocation.BOTTOM,
                    layout_type: BannerAdLayoutType.RESIZE
                })
            }
        })
    }

    checkRewardNativeAdds = (): void => {
        // bridge.send('VKWebAppCheckNativeAds', {
        //     ad_format: 'interstitial',
        // });
        bridge.send('VKWebAppCheckNativeAds', {
            ad_format: EAdsFormats.REWARD,
            use_waterfall: false
        }).then((r) => {
            if(r.result){
                this._nativeEcosystemEvent$.next({
                    type: 'spin-reward-ready',
                });
            }
        });
    }

    showRewardAdds = (): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            bridge.send('VKWebAppShowNativeAds', {
                ad_format: EAdsFormats.REWARD
            }).then((data) => {
                if(data.result){
                    resolve(true)
                }
                else{
                    reject()
                }
            }).catch(e => {reject()})
        })
    }

    startRewardAdds = (rqkey: string) => {
        this._nativeEcosystemEvent$.next({
            type: 'spin-reward-start',
            rqkey: rqkey
        });
    }

    finishRewardAdds = () => {
        this._nativeEcosystemEvent$.next({
            type: 'spin-reward-finish',
        });
    }

    showStoryBox = async (data: TGetShareImageResponse) => {
        return bridge.send('VKWebAppShowStoryBox', {
            /* @ts-ignore */
            attachment: data.attachment,
            /* @ts-ignore */
            background_type: data.background_type,
            locked: data.locked,
            blob: data.blob
        });
    }

    allowNotifications = () => {
        bridge.send('VKWebAppAllowNotifications');
    }

    addToFavorite = () => {
        bridge.send('VKWebAppAddToFavorites');
    }

    addToRecommended = () => {
        bridge.send('VKWebAppRecommend');
    }

    showSlidesSheet = (slides: any[]) => {
        bridge.send('VKWebAppShowSlidesSheet', {
            slides: slides
        })
    }

    checkAchievement = (achievementCode: string) => {
        if(achievementCode == 'group_subscriber'){
            bridge.send('VKWebAppJoinGroup', {
                group_id: parseInt(import.meta.env.VITE_VK_GROUP_ID)
            })
        }
    }

    queryFriends = async (accessToken: string): Promise<number[]> => {
        return new Promise((resolve, reject) => {
            bridge.send('VKWebAppCallAPIMethod', {
                method: 'execute.queryUserFriends',
                params: {
                    v: '5.199',
                    func_v: 1,
                    access_token: accessToken,
                    user_access_token: accessToken,
                }
            }).then((res) => {
                resolve(res.response as number[])
            }).catch((err) => {
                reject();
            })
        })
    }
}