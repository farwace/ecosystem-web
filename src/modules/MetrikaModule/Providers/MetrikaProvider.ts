import type {IMetrikaProvider} from "@/modules/MetrikaModule/Interfaces/IMetrikaProvider.ts";
import {injectable} from "inversify";
import type {App} from "vue";
import type {Store} from "pinia";
import type {IEcosystemStore} from "@/stores/Ecosystem/IEcosystemStore.ts";
import {ecosystemStore} from "@/stores/Ecosystem/ecosystemStore";

declare global {
    interface Window {
        ym?: any;
    }
}


@injectable()
export class MetrikaProvider implements IMetrikaProvider{

    protected readonly ecosystemStore: Store<'ecosystem', IEcosystemStore>;

    constructor() {
        this.ecosystemStore = ecosystemStore();
    }

    install(app: App, symbol: symbol) {
        app.provide(symbol, this);
    }

    setParams(params: any) {
        window?.ym?.(import.meta.env.VITE_YANDEX_METRIKA_ID, 'params', params)
    }
    setUserParams(params: any) {
        window?.ym?.(import.meta.env.VITE_YANDEX_METRIKA_ID, 'userParams', params);
    }

    reachGoal(goalName?: string, params?: any) {
        if(goalName){
            if(params){
                window?.ym?.(import.meta.env.VITE_YANDEX_METRIKA_ID,'reachGoal', goalName, params);
            }
            else{
                window?.ym?.(import.meta.env.VITE_YANDEX_METRIKA_ID,'reachGoal', goalName);
            }

        }
    }
}