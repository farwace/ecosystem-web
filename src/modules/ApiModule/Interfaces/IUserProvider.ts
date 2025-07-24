import type {IModule} from "@/modules/IModule.ts";
import type {TDailyMission} from "@/stores/Ecosystem/Types/TDailyMission.ts";

export interface IUserProvider  extends IModule{
    getUserInfo: () => Promise<void>;
    loadDailyMissions: () => Promise<void>;
}