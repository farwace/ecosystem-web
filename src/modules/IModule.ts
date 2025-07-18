import type {App} from "vue";

export interface IModule {
    install(app: App): void;
}