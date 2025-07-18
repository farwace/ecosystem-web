import type {IPlatformEvents} from "@/modules/EventsModule/Interfaces/IPlatformEvents.ts";
import {Subject} from "rxjs";
import type {GetLaunchParamsResponse, ReceiveDataMap, VKBridgeEvent} from "@vkontakte/vk-bridge";
import type {Store} from "pinia";
import type {IEcosystemStore} from "@/stores/Ecosystem/IEcosystemStore.ts";
import {ecosystemStore} from "@/stores/Ecosystem/ecosystemStore.ts";
import {Console} from "@/classes/utils/Console.ts";
import {calculateAge} from "@/classes/utils/CalculateAge.ts";
import {getAgeGroup} from "@/classes/utils/GetAgeGroup.ts";

export class StubEventsProvider implements IPlatformEvents{
    private _bridgeEvent$ = new Subject<VKBridgeEvent < keyof ReceiveDataMap>>();
    private ecosystemStore: Store<'ecosystem', IEcosystemStore>;

    constructor() {
        this.ecosystemStore = ecosystemStore();
    }

    async init(){
        await this.queryLaunchParams().then(() => {
            this.ecosystemStore.$patch({
                authString: `Bearer ${import.meta.env.VITE_VK_AUTH_STRING}`
            });
        });
    }

    getEmitter = ():Subject<VKBridgeEvent<keyof ReceiveDataMap>> => {
        return this._bridgeEvent$;
    }

    async queryLaunchParams(){
        try {
            const launchParams = this.getLaunchParams() as GetLaunchParamsResponse;

            if(launchParams.vk_app_id && launchParams.vk_app_id == import.meta.env.VITE_VK_APP_ID){
                const userInfo = this.getUserInfo();

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
        //bridge.send('VKWebAppInit');
    }

    getLaunchParams = (): GetLaunchParamsResponse => {
        const userId = import.meta.env.VITE_VK_USER_ID;
        const queryString = import.meta.env.VITE_VK_AUTH_STRING;
        const params = queryString.split('&');
        const result: {[key:string]:string} = {};
        params.forEach(param => {
            const [key, value = ''] = param.split('=');
            result[key] = value;
        });
        return result as unknown as GetLaunchParamsResponse;
    }

    getUserInfo = () => {
        const userId = import.meta.env.VITE_VK_USER_ID;
        return {
            "id": userId,
            "bdate": "3.10.1997",
            "bdate_visibility": 1,
            "country": {
                "id": 1,
                "title": "Россия"
            },
            "timezone": 3,
            "photo_200": "https://sun70-1.userapi.com/s/v1/ig2/Mnbl4RlowjH_RK3F4WtScE7ZDNV1bEffN0zmkmJMPRlcSU1aSqCExpd3DgQ8pKFC1Lat8JMNx74crBuhsdZiCV7A.jpg?quality=95&crop=67,1,760,760&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720&ava=1&u=xcC0HAjSZgUX3g2E42IUjU3tG-JqrJWCoUrkvX060A8&cs=200x200",
            "photo_max_orig": "https://sun70-1.userapi.com/s/v1/ig2/Mnbl4RlowjH_RK3F4WtScE7ZDNV1bEffN0zmkmJMPRlcSU1aSqCExpd3DgQ8pKFC1Lat8JMNx74crBuhsdZiCV7A.jpg?quality=95&crop=67,1,760,760&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720&ava=1&u=xcC0HAjSZgUX3g2E42IUjU3tG-JqrJWCoUrkvX060A8&cs=240x240",
            "sex": 2,
            "photo_100": "https://sun70-1.userapi.com/s/v1/ig2/Mnbl4RlowjH_RK3F4WtScE7ZDNV1bEffN0zmkmJMPRlcSU1aSqCExpd3DgQ8pKFC1Lat8JMNx74crBuhsdZiCV7A.jpg?quality=95&crop=67,1,760,760&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720&ava=1&u=xcC0HAjSZgUX3g2E42IUjU3tG-JqrJWCoUrkvX060A8&cs=100x100",
            "photo_base": "https://sun70-1.userapi.com/s/v1/ig2/Mnbl4RlowjH_RK3F4WtScE7ZDNV1bEffN0zmkmJMPRlcSU1aSqCExpd3DgQ8pKFC1Lat8JMNx74crBuhsdZiCV7A.jpg?quality=95&crop=67,1,760,760&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720&ava=1&u=xcC0HAjSZgUX3g2E42IUjU3tG-JqrJWCoUrkvX060A8",
            "first_name": "Виталий",
            "last_name": "Панфилов",
            "can_access_closed": true,
            "is_closed": false
        }
    }

}