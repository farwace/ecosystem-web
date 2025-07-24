import type {TDailyMission} from "@/stores/Ecosystem/Types/TDailyMission.ts";

export interface IDailyMissionsStore {
    isDailyMissionsLoading: boolean;
    dailyMissionsHasBeenLoaded: boolean;
    dailyMissionsLoadingError: boolean;
    dailyMissionList: TDailyMission[];
}