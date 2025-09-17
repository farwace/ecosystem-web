import type {IGameProvider} from "@/modules/GameModule/Interfaces/IGameProvider.ts";
import type {App} from "vue";
import {inject, injectable} from "inversify";
import type {Store} from "pinia";
import type {IGameStore} from "@/stores/Game/IGameStore.ts";
import {gameStore} from "@/stores/Game/gameStore.ts";
import {UserProviderSymbol} from "@/modules/ApiModule/symbols.ts";
import type {IUserProvider} from "@/modules/ApiModule/Interfaces/IUserProvider.ts";
import type {TInGameInfo} from "@/stores/Game/Types/TInGameInfo.ts";

@injectable()
export class GameProvider implements IGameProvider {
    protected readonly gameStore: Store<'game', IGameStore>;

    constructor(
        @inject(UserProviderSymbol)
        private userProvider: IUserProvider,
    ) {
        this.gameStore = gameStore();
    }

    install(app: App, symbol: symbol) {
        app.provide(symbol, this);
    }

    removeInGame = () => {
        this.gameStore.$patch({
            inGameRoom: undefined
        });
    }

    setInGame = (game: TInGameInfo) => {
        this.gameStore.$patch({
            inGameRoom: game,
        });
    }

    sendGameStarted = async (game: TInGameInfo) => {
        try {
            await this.userProvider.sendGameStarted(game);
            this.setInGame(game);
        }
        catch (e: any){}
    }
}