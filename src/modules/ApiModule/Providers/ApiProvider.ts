import type {IApiProvider} from "@/modules/ApiModule/Interfaces/IApiProvider.ts";
import type {IEcosystemStore} from "@/stores/Ecosystem/IEcosystemStore.ts";
import {ecosystemStore} from "@/stores/Ecosystem/ecosystemStore";
import type {Store} from "pinia";
import type {App} from "vue";

export abstract class ApiProvider implements IApiProvider{
    protected readonly ecosystemStore: Store<'ecosystem', IEcosystemStore>;

    constructor() {
        this.ecosystemStore = ecosystemStore();
    }

    install(app: App, symbol: symbol) {
        app.provide(symbol, this);
    }

    getApiEndpoint = () => {
        return `${import.meta.env.VITE_API_ENDPOINT}api/vk/${import.meta.env.VITE_API_VERSION}`
    }

    getHeaders = () => {
        return {
            'Authorization': this.ecosystemStore.$state.authString,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }
}