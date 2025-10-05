import type {IModule} from "@/modules/IModule.ts";
import type {TResponse} from "@/modules/ApiModule/Types/TResponse.ts";
import type {TGetGameInfo} from "@/modules/ApiModule/Types/TGetGameInfo.ts";

export interface IGameApiProvider  extends IModule{
    getGameInfo(code: string):Promise<TResponse<TGetGameInfo>>;
}