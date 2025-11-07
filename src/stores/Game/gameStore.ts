import {defineStore} from "pinia";
import type {IGameStore} from "@/stores/Game/IGameStore.ts";
import type {TInGameInfo} from "@/stores/Game/Types/TInGameInfo.ts";


export const gameStore = defineStore('game', {
    state: ():IGameStore => ({
        inGameRoom: undefined,
        isHidden: false,
        lastMessages: [],
    })
})