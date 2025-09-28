import type {IApiProvider} from "@/modules/ApiModule/Interfaces/IApiProvider.ts";
import type {IEcosystemStore} from "@/stores/Ecosystem/IEcosystemStore.ts";
import {ecosystemStore} from "@/stores/Ecosystem/ecosystemStore";
import type {Store} from "pinia";
import type {App} from "vue";
import type {IDailyMissionsStore} from "@/stores/DailyMissions/IDailyMissionsStore.ts";
import {dailyMissionsStore} from "@/stores/DailyMissions/dailyMissionsStore.ts";
import type {TResponse} from "@/modules/ApiModule/Types/TResponse.ts";
import {achievementsStore} from "@/stores/Achievements/achievementsStore.ts";
import type {IAchievementsStore} from "@/stores/Achievements/IAchievementsStore.ts";
import {gameStore} from "@/stores/Game/gameStore.ts";
import type {IGameStore} from "@/stores/Game/IGameStore.ts";

export abstract class ApiProvider implements IApiProvider{
    protected readonly ecosystemStore: Store<'ecosystem', IEcosystemStore>;
    protected readonly dailyMissionsStore: Store<'dailyMissions', IDailyMissionsStore>;
    protected readonly achievementsStore: Store<'achievements', IAchievementsStore>;
    protected readonly gameStore: Store<'game', IGameStore>;

    constructor() {
        this.ecosystemStore = ecosystemStore();
        this.dailyMissionsStore = dailyMissionsStore();
        this.achievementsStore = achievementsStore();
        this.gameStore = gameStore();
    }

    install(app: App, symbol: symbol) {
        app.provide(symbol, this);
    }

    getApiEndpoint = () => {
        return `${import.meta.env.VITE_API_ENDPOINT}api/${import.meta.env.VITE_API_VERSION}`
    }

    getHeaders = () => {
        return {
            'Authorization': this.ecosystemStore.$state.authString,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }

    fetch = async (url: string, opt?: RequestInit, body?: any, errorCallback = (message?: string) => {}): Promise<TResponse<unknown>> => {
        const options: RequestInit = {
            method: "GET",
            cache: "no-cache",
            headers: this.getHeaders(),
            credentials: "same-origin",
        }

        if(opt){
            Object.keys(opt).forEach(key => {
                const k = key as keyof RequestInit;
                options[k] = opt[k] as unknown as any;
            })
        }

        if(body){
            options.body = JSON.stringify(body);
        }

        const res = await fetch(url, options);
        const data = await res.json();
        if(res.status != 200){
            if(data?.message){
                errorCallback(data.message);
            }
            throw new Error(res.status.toString());
        }
        return data;
    }
}