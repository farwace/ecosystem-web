import type {IGameProvider} from "@/modules/GameModule/Interfaces/IGameProvider.ts";
import type {App} from "vue";
import {inject, injectable} from "inversify";
import type {Store} from "pinia";
import type {IGameStore} from "@/stores/Game/IGameStore.ts";
import {gameStore} from "@/stores/Game/gameStore.ts";
import {UserProviderSymbol} from "@/modules/ApiModule/symbols.ts";
import type {IUserProvider} from "@/modules/ApiModule/Interfaces/IUserProvider.ts";
import type {TInGameInfo} from "@/stores/Game/Types/TInGameInfo.ts";
import {useAnimatedRouter} from "@/classes/utils/useAnimatedRouter.ts";

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

    navigateToGame = (location?:string) => {
        if(!location){
            return;
        }
        const fragments = location.split('---');
        const obParameters: {[key: string]: any} = {};
        for(let i = 0; i < fragments.length; i++){
            const param = fragments[i].split('=');
            if(param[0] && param[1]){
                obParameters[param[0]] = param[1];
            }
        }
        const router = useAnimatedRouter();
        if(obParameters?.['game'] == 'bunker' && obParameters?.['room']){
            router.push({name: 'bunkerGame', query: {"room_id": obParameters['room']}});
        }
    }
}