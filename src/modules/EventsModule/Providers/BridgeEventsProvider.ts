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

export class BridgeEventsProvider implements IPlatformEvents {
    private _bridgeEvent$ = new Subject<VKBridgeEvent<keyof ReceiveDataMap>>();
    private ecosystemStore: Store<'ecosystem', IEcosystemStore>

    constructor() {
        bridge.subscribe((event) => {
            this._bridgeEvent$.next(event);
        });
        this.ecosystemStore = ecosystemStore();
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
        try {
            const launchParams = await bridge.send('VKWebAppGetLaunchParams');

            if(launchParams.vk_app_id && launchParams.vk_app_id == import.meta.env.VITE_VK_APP_ID){
                const userInfo = await bridge.send('VKWebAppGetUserInfo', {user_id: launchParams.vk_user_id});

                const sex = userInfo.sex || 2;
                const age = getAgeGroup(calculateAge(userInfo.bdate));

                this.ecosystemStore.$patch({
                    launchParams: launchParams,
                    name: userInfo.first_name,
                    lastName: userInfo.last_name,
                    avatar: userInfo.photo_100,
                    sex: sex,
                    age: age,
                    socialId: launchParams.vk_user_id,
                });
            }
        }
        catch (e) {
            Console.log('<<<>>> Launch Params Error <<<>>>');
        }
    }

    setApplicationIsReady = async () => {
        return bridge.send('VKWebAppInit');
    }
}