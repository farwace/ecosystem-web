import type {IUserProvider} from "@/modules/ApiModule/Interfaces/IUserProvider.ts";
import {ApiProvider} from "@/modules/ApiModule/Providers/ApiProvider.ts";
import type {TGetUserInfoResponse} from "@/modules/ApiModule/Types/TGetUserInfoResponse.ts";
import {inject, injectable} from "inversify";
import type {TResponse} from "@/modules/ApiModule/Types/TResponse.ts";
import {PlatformEventsSymbol} from "@/modules/EventsModule/symbols.ts";
import type {IPlatformEvents} from "@/modules/EventsModule/Interfaces/IPlatformEvents.ts";
import type {TDailyMission} from "@/stores/Ecosystem/Types/TDailyMission.ts";
import type {TReverbMessage} from "@/modules/ReverbModule/Types/TReverbMessage.ts";
import type {TUserProfile} from "@/modules/ApiModule/Types/TUserProfile.ts";

@injectable()
export class UserProvider extends ApiProvider implements IUserProvider{

    constructor(
        @inject(PlatformEventsSymbol)
        private platformEvents: IPlatformEvents

    ) {
        super();
    }

    getUserInfo = async () => {
        try{
            const res: TResponse<TGetUserInfoResponse> = await this.fetch(`${this.getApiEndpoint()}/user/info`, { method: "POST"}, {
                first_name: this.ecosystemStore.$state.firstName,
                last_name: this.ecosystemStore.$state.lastName,
                avatar: this.ecosystemStore.$state.avatar,
                avatar_big: this.ecosystemStore.$state.avatarBig,
                sex: this.ecosystemStore.$state.sex
            }) as TResponse<TGetUserInfoResponse>;
            const resData = res.data;

            this.ecosystemStore.$patch({
                id: resData.id,
                firstName: resData.firstName,
                lastName: resData.lastName,
                age: resData.ageGroup || undefined,
                avatar: resData.avatar || undefined,
                sex: resData.sex,
                isBanned: resData.isBanned,
                banReason: resData.banReason,
                bannedAt: resData.bannedAt,
                bannedUntil: resData.bannedUntil,
                dailyEnter: resData.dailyEnter,
                consecutiveDays: resData.consecutiveDays,
                isAnonymous: resData.isAnonymous,
                isNew: resData.isNew,
                experience: resData.experience,
                popularity: resData.popularity,
                balance: resData.balance,
                balanceGift: resData.balanceGifts,
                // recentAchievements: resData.recentAchievements,
                // recentLiked: resData.recentLiked,
                // topFans: resData.topFans,
                // topGifts: resData.topGifts,
                // visitors: resData.visitors,
                subscription: resData.subscription || undefined,
                canUseTrialSubscription: resData.canUseTrialSubscription,
                vip: resData.vip,
                popularityLevel: resData.popularityLevel,
                lvl: resData.lvl,
                nextLevelExperience: resData.nextLevelExperience,
                nextLevelPopularity: resData.nextLevelPopularity,
                currentDay: resData.currentDay
            });

            this.dailyMissionsStore.$patch({
                dailyMissionsHasBeenLoaded: true,
                dailyMissionList: resData.dailyMissions
            })

            await this.platformEvents.setApplicationIsReady();


        }
        catch (e){
            await this.platformEvents.setApplicationLoadError();
        }
    }

    loadDailyMissions = async (): Promise<void> => {
        try{
            this.dailyMissionsStore.$patch({
                isDailyMissionsLoading: true
            })

            const res: TResponse<TDailyMission[]> = await this.fetch(`${this.getApiEndpoint()}/daily-missions`) as TResponse<TDailyMission[]>;
            this.dailyMissionsStore.$patch({
                dailyMissionsHasBeenLoaded: true,
                dailyMissionList: res.data
            })
        }
        catch (e: any){
            this.dailyMissionsStore.$patch({
                dailyMissionsLoadingError: true
            })
            return undefined;
        }
        finally {
            this.dailyMissionsStore.$patch({
                isDailyMissionsLoading: false
            })
        }
    }

    loadMissedEvents = async (): Promise<TResponse<TReverbMessage<unknown>[]>> => {
        return await this.fetch(`${this.getApiEndpoint()}/user/missed-events`) as TResponse<TReverbMessage<unknown>[]>;
    }

    receiveDailyEnter = (): Promise<TResponse<boolean>> => {
        return this.fetch(`${this.getApiEndpoint()}/daily-missions/receive-daily-enter`, {
            method: "POST"
        }) as Promise<TResponse<boolean>>;
    }



    receiveMission = async (missionId: number): Promise<TResponse<any>> => {
        return await this.fetch(`${this.getApiEndpoint()}/daily-missions/pick`, {
            method: "POST",
        }, {
            id: missionId,
        }) as unknown as Promise<TResponse<any>>;
    }

    receiveMissionBox = async (box: number): Promise<TResponse<boolean>> => {
        return await this.fetch(`${this.getApiEndpoint()}/daily-missions/receive-daily-enter-box`, {
            method: "POST",
        }, {
            box
        }) as unknown as Promise<TResponse<boolean>>;
    }

    getProfile = async (id: number | string): Promise<TResponse<TUserProfile>> => {
        return await this.fetch(`${this.getApiEndpoint()}/user/info/${id}`) as unknown as Promise<TResponse<TUserProfile>>;
    }

}