import type {IModule} from "@/modules/IModule.ts";

export interface IApiProvider extends IModule{
    getHeaders: () => {[key:string]:string};
    getApiEndpoint: () => string;
}