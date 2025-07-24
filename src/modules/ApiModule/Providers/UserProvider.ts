import type {IUserProvider} from "@/modules/ApiModule/Interfaces/IUserProvider.ts";
import {ApiProvider} from "@/modules/ApiModule/Providers/ApiProvider.ts";
import type {TGetUserInfoResponse} from "@/modules/ApiModule/Types/TGetUserInfoResponse.ts";
import {inject, injectable} from "inversify";
import type {TResponse} from "@/modules/ApiModule/Types/TResponse.ts";
import {PlatformEventsSymbol} from "@/modules/EventsModule/symbols.ts";
import type {IPlatformEvents} from "@/modules/EventsModule/Interfaces/IPlatformEvents.ts";
import type {TDailyMission} from "@/stores/Ecosystem/Types/TDailyMission.ts";

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
            const response:Response = await fetch(`${this.getApiEndpoint()}/user/info`, {
                method: "POST",
                cache: "no-cache",
                headers: this.getHeaders(),
                credentials: "same-origin",
                body: JSON.stringify({
                    first_name: this.ecosystemStore.$state.firstName,
                    last_name: this.ecosystemStore.$state.lastName,
                    avatar: this.ecosystemStore.$state.avatar,
                    avatar_big: this.ecosystemStore.$state.avatarBig,
                    sex: this.ecosystemStore.$state.sex
                })
            });

            const res: TResponse<TGetUserInfoResponse> = await response.json();
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
                recentAchievements: resData.recentAchievements,
                recentLiked: resData.recentLiked,
                topFans: resData.topFans,
                topGifts: resData.topGifts,
                visitors: resData.visitors,
                subscription: resData.subscription || undefined,
                canUseTrialSubscription: resData.canUseTrialSubscription,
                vip: resData.vip,
                popularityLevel: resData.popularityLevel,
                lvl: resData.lvl,
                nextLevelExperience: resData.nextLevelExperience,
                nextLevelPopularity: resData.nextLevelPopularity,
            });


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
            const response: Response = await fetch(`${this.getApiEndpoint()}/user/daily-missions`, {
                method: 'GET',
                cache: "no-cache",
                headers: this.getHeaders(),
                credentials: "same-origin",
            });

            const res: TResponse<TDailyMission[]> = await response.json();
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

    receiveMission = async (missionId: number): Promise<void> => {
        //todo: 1) Отправка запроса на получение награды за миссию
        // 2) отметка задания как отмеченное!
    }
}