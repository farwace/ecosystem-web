import {defineStore} from "pinia";
import type {IDailyMissionsStore} from "@/stores/DailyMissions/IDailyMissionsStore.ts";
import type {TDailyMission} from "@/stores/Ecosystem/Types/TDailyMission.ts";
import {ecosystemStore} from "@/stores/Ecosystem/ecosystemStore.ts";

export const dailyMissionsStore = defineStore('dailyMissions', {
    state: (): IDailyMissionsStore => ({
        dailyMissionList: [],
        dailyMissionsHasBeenLoaded: false,
        dailyMissionsLoadingError: false,
        isDailyMissionsLoading: false
    }),
    getters: {
        hasUnclaimedCompletedMission(state): boolean {
            return state.dailyMissionList.some((m: TDailyMission) =>
                m.completed &&
                !m.received &&
                (m.personalAccess && ecosystemStore().$state.subscription?.personalAccess) //todo: Тестирование что красная точка горит если есть премиум, и не горит если премиума нет
            );
        }
    }
})