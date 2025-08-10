import {defineStore} from "pinia";
import type {IAchievementsStore} from "@/stores/Achievements/IAchievementsStore.ts";
import type {TUserAchievement} from "@/stores/Achievements/Types/TUserAchievement.ts";

export const achievementsStore = defineStore('achievements', {
    state: (): IAchievementsStore => ({
        achievementList: [],
        achievementSections: [],
    }),
    getters: {
        hasUnclaimedCompletedAchievement(state): boolean {
            return state.achievementList.some((m: TUserAchievement) =>
                m.completed &&
                !m.received
            );
        }
    }
});