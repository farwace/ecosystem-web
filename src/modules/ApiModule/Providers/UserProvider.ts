import type {IUserProvider} from "@/modules/ApiModule/Interfaces/IUserProvider.ts";
import {ApiProvider} from "@/modules/ApiModule/Providers/ApiProvider.ts";
import type {TGetUserInfoResponse} from "@/modules/ApiModule/Types/TGetUserInfoResponse.ts";
import {injectable} from "inversify";

@injectable()
export class UserProvider extends ApiProvider implements IUserProvider{

    getUserInfo = async () => {
        const response:Response = await fetch(`${this.getApiEndpoint()}/user/info`, {
            method: "POST",
            cache: "no-cache",
            headers: this.getHeaders(),
            credentials: "same-origin",
        });

        const resData: TGetUserInfoResponse = await response.json();
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
            subscription: resData.subscription,
            vip: resData.vip,
            popularityLevel: resData.popularityLevel,
            lvl: resData.lvl,
            nextLevelExperience: resData.nextLevelExperience,
            nextLevelPopularity: resData.nextLevelPopularity,
        });


    }
}