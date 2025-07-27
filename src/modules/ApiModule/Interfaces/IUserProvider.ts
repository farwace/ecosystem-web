import type {IModule} from "@/modules/IModule.ts";
import type {TResponse} from "@/modules/ApiModule/Types/TResponse.ts";
import type {TReverbMessage} from "@/modules/ReverbModule/Types/TReverbMessage.ts";

export interface IUserProvider  extends IModule{
    getUserInfo: () => Promise<void>;
    loadDailyMissions: () => Promise<void>;
    receiveMission:(itemId: number) => Promise<TResponse<any>>;
    loadMissedEvents: () => Promise<TResponse<TReverbMessage<unknown>[]>>;
    receiveDailyEnter: () => Promise<TResponse<boolean>>;
}