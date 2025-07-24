export type TDailyMission = {
    id: number;
    completed: boolean;
    replays: number;
    received: boolean;
    name: string;
    description: string | null;
    sort: number;
    eventReplays: number;
    experience: number;
    coins: number;
    personalAccess: boolean
}