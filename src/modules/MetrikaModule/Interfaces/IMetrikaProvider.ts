import type {IModule} from "@/modules/IModule.ts";
import type {Subject} from "rxjs";

export interface IMetrikaProvider extends IModule{
    setUserParams(params: any):void;
    setParams(params: any):void;
    reachGoal(goalName?: string, params?: any):void;
    getEventsObserver$(): Subject<{name?: string, params?: any}>;
}