import type {IModule} from "@/modules/IModule.ts";
import type {TInGameInfo} from "@/stores/Game/Types/TInGameInfo.ts";

export interface IGameProvider extends IModule {
    removeInGame: () => void;
    setInGame: (game: TInGameInfo) => void;
    sendGameStarted: (game: TInGameInfo) => Promise<void>;
    navigateToGame: (location: string) => Promise<void>;
    setRouter: (router: any) => void;
}