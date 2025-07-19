import {defineStore} from "pinia";
import type {IBridgeStore} from "@/stores/Bridge/IBridgeStore.ts";

export const bridgeStore = defineStore('bridge', {
    state: ():IBridgeStore => ({
        videoAdvAccepted: true,//todo: false
        inFavorites: false,
        inHomeScreen: false,
    })
})