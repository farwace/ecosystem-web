import type {IModule} from "@/modules/IModule.ts";

export interface IMetrikaProvider extends IModule{
    setUserParams(params: any):void;
    setParams(params: any):void;
    reachGoal(goalName?: string, params?: any):void;
}