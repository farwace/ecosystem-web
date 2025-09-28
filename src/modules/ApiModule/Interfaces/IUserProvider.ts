import type {IModule} from "@/modules/IModule.ts";
import type {TResponse} from "@/modules/ApiModule/Types/TResponse.ts";
import type {TReverbMessage} from "@/modules/ReverbModule/Types/TReverbMessage.ts";
import type {TUserProfile} from "@/modules/ApiModule/Types/TUserProfile.ts";
import type {TUser} from "@/stores/Ecosystem/Types/TUser.ts";
import type {TGift} from "@/stores/Ecosystem/Types/TGift.ts";
import type {TRequestScopeResponse} from "@/modules/ApiModule/Types/TRequestScopeResponse.ts";
import type {TInGameInfo} from "@/stores/Game/Types/TInGameInfo.ts";
import type {TGetShareImageResponse} from "@/modules/ApiModule/Types/TGetShareImageResponse.ts";

export interface IUserProvider  extends IModule{
    getUserInfo: () => Promise<void>;
    loadDailyMissions: () => Promise<void>;
    receiveMission:(itemId: number) => Promise<TResponse<any>>;
    receiveAchievement:(itemId: number) => Promise<TResponse<any>>;
    loadMissedEvents: () => Promise<TResponse<TReverbMessage<unknown>[]>>;
    receiveDailyEnter: () => Promise<TResponse<boolean>>;
    receiveMissionBox: (box: number) => Promise<TResponse<boolean>>;
    getProfile:(id: number) => Promise<TResponse<TUserProfile>>;
    getTopFans: (id: number) => Promise<TResponse<TUser[]>>
    getTopGifts: (id: number) => Promise<TResponse<TGift[]>>
    updateProfile: (body: {[key:string]:string}) => Promise<TResponse<any>>;
    getPopularityRating: () => Promise<TResponse<TUser[]>>;
    queryAuthToken: (scope: string) => Promise<TResponse<TRequestScopeResponse>>;
    setAuthToken: (accessToken: string, scope: string, expires: number) => Promise<TResponse<boolean>>;
    sendGameStarted: (game: TInGameInfo) => Promise<void>;
    getShareInfo: (type: "loose" | "won") => Promise<TResponse<TGetShareImageResponse>>;
    sendShareComplete: (dataToSend: {[key: string]: any}) => Promise<void>;
}