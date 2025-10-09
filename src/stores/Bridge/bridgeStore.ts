import {defineStore} from "pinia";
import type {IBridgeStore} from "@/stores/Bridge/IBridgeStore.ts";

export const bridgeStore = defineStore('bridge', {
    state: ():IBridgeStore => ({
        videoRewardAdvKey: '',
        shareStoryKey: '',
        inFavorites: true,
        inHomeScreen: true,
        inRecommended: true,
        notificationsEnabled: true,
        accessToken: '',
        scope: '',
    })
})