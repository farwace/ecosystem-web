import type {IModule} from "@/modules/IModule.ts";
import type {TResponse} from "@/modules/ApiModule/Types/TResponse.ts";

export interface IApiProvider extends IModule{
    getHeaders: () => {[key:string]:string};
    getApiEndpoint: () => string;
    fetch: (url: string, options?: RequestInit, body?: any) => Promise<TResponse<unknown>>;
}