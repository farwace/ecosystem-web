import type {TUserAchievement} from "@/stores/Achievements/Types/TUserAchievement.ts";
import type {TAchievementSection} from "@/stores/Achievements/Types/TAchievementSection.ts";
import type {TShopCoin} from "@/modules/ApiModule/Types/TShopCoin.ts";
import type {TShopSubscription} from "@/modules/ApiModule/Types/TShopSubscription.ts";

export interface IAchievementsStore {
    achievementList: TUserAchievement[];
    achievementSections: TAchievementSection[];
    canUseTrialSubscription?: boolean;
    shopCoins?: TShopCoin[],
    shopSubscription?: TShopSubscription[];
}