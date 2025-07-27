import type {TAgeGroup} from "@/stores/Ecosystem/IEcosystemStore.ts";
import type {TGift} from "@/stores/Ecosystem/Types/TGift.ts";
import type {TDailyEnter} from "@/stores/Ecosystem/Types/TDailyEnter.ts";
import type {TAchievement} from "@/stores/Ecosystem/Types/TAchievement.ts";
import type {TUser} from "@/stores/Ecosystem/Types/TUser.ts";
import type {TSubscription} from "@/stores/Ecosystem/Types/TSubscription.ts";
import type {TDailyMission} from "@/stores/Ecosystem/Types/TDailyMission.ts";

export type TGetUserInfoResponse = {
    id: number;
    firstName: string;
    lastName: string;
    ageGroup: TAgeGroup | null;
    avatar: string | null;
    sex: number;

    isBanned: boolean;
    banReason?: string | null;
    bannedAt?: string | null;
    bannedUntil?: string | null;

    currentDay: keyof TDailyEnter;
    dailyEnter: TDailyEnter;
    showDailyGift: boolean;
    consecutiveDays: number;
    dailyMissions: TDailyMission[];

    isAnonymous: boolean;
    isNew: boolean;

    experience: number;
    lvl: number;
    nextLevelExperience: number;
    popularity: number;
    popularityLevel: number;
    nextLevelPopularity: number;
    balance: number;
    balanceGifts: TGift[];

    recentAchievements: TAchievement[];
    recentLiked: TUser[];
    topFans: TUser[];
    topGifts: TGift[];
    visitors: TUser[];

    canUseTrialSubscription: boolean;

    subscription: null | TSubscription;
    vip: boolean;
}