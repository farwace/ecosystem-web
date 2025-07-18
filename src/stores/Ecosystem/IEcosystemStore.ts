import type {TGift} from "@/stores/Ecosystem/Types/TGift";
import type {TAchievement} from "@/stores/Ecosystem/Types/TAchievement";
import type {TUser} from "@/stores/Ecosystem/Types/TUser";
import type {TMission} from "@/stores/Ecosystem/Types/TMission";
import type {GetLaunchParamsResponse} from "@vkontakte/vk-bridge";
import type {TDailyEnter} from "@/stores/Ecosystem/Types/TDailyEnter.ts";
import type {TSubscription} from "@/stores/Ecosystem/Types/TSubscription.ts";

export interface IEcosystemStore {
    authString: string,
    launchParams?:GetLaunchParamsResponse
    id: TUser['id'],
    avatar?: TUser['avatar'],
    firstName: TUser['firstName'],
    lastName: TUser['lastName'],
    sex: TUser['sex'],
    lvl: TUser['lvl'],
    popularity: TUser['popularity'],
    popularityLevel: TUser['popularityLevel'],
    experience: TUser['experience'],
    nextLevelExperience: number,
    nextLevelPopularity: number,
    isNew:boolean,
    vipLevel:number,
    vip: boolean,

    isBanned?: boolean,
    banReason?: string | null;
    bannedAt?: string | null;
    bannedUntil?: string | null;

    dailyEnter?:TDailyEnter,
    consecutiveDays?:number,
    isAnonymous?: boolean,
    balanceGift?:TGift[],
    topGifts?:TGift[],
    topFans?:TUser[],
    visitors?:TUser[],
    subscription?:TSubscription,

    socialId: number,
    balance: number,
    age?: TAgeGroup,
    hasNotifications: boolean,

    recentGifts: TGift[],
    recentAchievements: TAchievement[],
    recentFans: TUser[],
    recentLiked: TUser[],
    topRatingPerson: string,
    missionList: TMission[],

    giftList: TGift[],
    achievementsList: TAchievement[],
}

export enum AgeGroup {
    'zoomer' = '1',
    'millenial'= '2',
    'doomer'= '4',
    'boomer'= '8',
}
export type TAgeGroup = `${AgeGroup}`;