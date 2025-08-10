import type {TUserAchievement} from "@/stores/Achievements/Types/TUserAchievement.ts";
import type {TAchievementSection} from "@/stores/Achievements/Types/TAchievementSection.ts";

export interface IAchievementsStore {
    achievementList: TUserAchievement[];
    achievementSections: TAchievementSection[];
}