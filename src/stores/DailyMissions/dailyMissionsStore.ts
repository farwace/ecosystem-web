import {defineStore} from "pinia";
import type {IDailyMissionsStore} from "@/stores/DailyMissions/IDailyMissionsStore.ts";

export const dailyMissionsStore = defineStore('dailyMissions', {
    state: (): IDailyMissionsStore => ({
        dailyMissionList: [],
        dailyMissionsHasBeenLoaded: false,
        dailyMissionsLoadingError: false,
        isDailyMissionsLoading: false
    })
})