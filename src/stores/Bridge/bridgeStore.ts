import {defineStore} from "pinia";
import type {IBridgeStore} from "@/stores/Bridge/IBridgeStore.ts";

export const bridgeStore = defineStore('bridge', {
    state: ():IBridgeStore => ({
        videoRewardAdvKey: '',
        shareStoryKey: '',
        inFavorites: false,
        inHomeScreen: false,
    })
})