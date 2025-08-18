import type {TGift} from "@/stores/Ecosystem/Types/TGift";
import type {TAchievement} from "@/stores/Ecosystem/Types/TAchievement";
import type {TUser} from "@/stores/Ecosystem/Types/TUser";
import type {GetLaunchParamsResponse} from "@vkontakte/vk-bridge";
import type {TDailyEnter} from "@/stores/Ecosystem/Types/TDailyEnter.ts";
import type {TSubscription} from "@/stores/Ecosystem/Types/TSubscription.ts";
import type {TAnimal} from "@/stores/Ecosystem/Types/TAnimal.ts";

export interface IEcosystemStore {
    authString: string;
    connectionId?:any,
    launchParams?:GetLaunchParamsResponse;
    id: TUser['id'];
    avatar?: TUser['avatar'];
    avatarBig?: TUser['avatar'];
    firstName: TUser['firstName'];
    animal: string,
    animals: TAnimal[],
    lastName: TUser['firstName'];
    sex: TUser['sex'];
    lvl: TUser['lvl'];
    popularity: TUser['popularity'];
    popularityLevel: TUser['popularityLevel'];
    experience: TUser['experience'];
    nextLevelExperience: number;
    nextLevelPopularity: number;
    isNew:boolean;
    vip: boolean;
    canUseTrialSubscription?:boolean;

    isBanned?: boolean;
    banReason?: string | null;
    bannedAt?: string | null;
    bannedUntil?: string | null;

    socialId: number;
    balance: number;
    ageGroup?: TAgeGroup;


    vipLevel:number;
    currentDay: keyof TDailyEnter
    dailyEnter?:TDailyEnter;
    consecutiveDays?:number;
    isAnonymous?: boolean;
    balanceGift?:TGift[];
    // topGifts?:TGift[];
    // topFans?:TUser[];
    visitors?:TUser[];
    subscription?:TSubscription;
    hasNotifications: boolean;

    // recentGifts: TGift[];
    // recentAchievements: TAchievement[];
    // recentFans: TUser[];
    // recentLiked: TUser[];
    // topRatingPerson: string;

    giftList: TGift[];
    achievementsList: TAchievement[];
}

export enum AgeGroup {
    'zoomer' = '1',
    'millenial'= '2',
    'doomer'= '4',
    'boomer'= '8',
}
export type TAgeGroup = `${AgeGroup}`;