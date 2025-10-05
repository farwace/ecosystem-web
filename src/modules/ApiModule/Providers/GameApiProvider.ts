import {ApiProvider} from "@/modules/ApiModule/Providers/ApiProvider.ts";
import {injectable} from "inversify";
import type {IGameApiProvider} from "@/modules/ApiModule/Interfaces/IGameApiProvider.ts";
import type {TResponse} from "@/modules/ApiModule/Types/TResponse.ts";
import type {TGetGameInfo} from "@/modules/ApiModule/Types/TGetGameInfo.ts";

@injectable()
export class GameApiProvider extends ApiProvider implements IGameApiProvider{

    constructor(

    ) {
        super();
    }


    async getGameInfo(code: string): Promise<TResponse<TGetGameInfo>> {
        return await this.fetch(`${this.getApiEndpoint()}/games/${code}/info`) as unknown as TResponse<TGetGameInfo>;
    }

}