import type {IModule} from "@/modules/IModule.ts";
import type {Subject} from "rxjs";
import type {TReverbMessage} from "@/modules/ReverbModule/Types/TReverbMessage.ts";

export interface IReverbProvider  extends IModule{
    getReverbObserver$(): Subject<TReverbMessage<unknown>>
}