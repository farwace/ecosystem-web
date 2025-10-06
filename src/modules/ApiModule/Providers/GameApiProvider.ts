import {ApiProvider} from "@/modules/ApiModule/Providers/ApiProvider.ts";
import {injectable} from "inversify";
import type {IGameApiProvider} from "@/modules/ApiModule/Interfaces/IGameApiProvider.ts";
import type {TResponse} from "@/modules/ApiModule/Types/TResponse.ts";
import type {TGetGameInfo} from "@/modules/ApiModule/Types/TGetGameInfo.ts";
import type {TOnboardingSlide} from "@/modules/ApiModule/Types/TOnboardingSlide.ts";

@injectable()
export class GameApiProvider extends ApiProvider implements IGameApiProvider{

    constructor(

    ) {
        super();
    }


    async getGameInfo(code: string): Promise<TResponse<TGetGameInfo>> {
        return await this.fetch(`${this.getApiEndpoint()}/games/${code}/info`) as unknown as TResponse<TGetGameInfo>;
    }

    async voteForGame(code: string): Promise<TResponse<boolean>> {
        return await this.fetch(`${this.getApiEndpoint()}/games/${code}/vote`, {
            method: 'POST'
        }) as unknown as TResponse<boolean>
    }

    async loadOnBoarding(code: string): Promise<TResponse<TOnboardingSlide[]>> {
        return await this.fetch(`${this.getApiEndpoint()}/onboard/slides/${code}`) as unknown as TResponse<TOnboardingSlide[]>
    }
}