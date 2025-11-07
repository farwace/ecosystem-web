import type {TInGameInfo} from "@/stores/Game/Types/TInGameInfo.ts";

export interface IGameStore {
    inGameRoom?: TInGameInfo,
    isHidden: boolean;
    lastMessages: string[];
}