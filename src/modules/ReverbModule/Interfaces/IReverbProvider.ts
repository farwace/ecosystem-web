import type {IModule} from "@/modules/IModule.ts";
import type {Subject} from "rxjs";
import type {TReverbMessage} from "@/modules/ReverbModule/Types/TReverbMessage.ts";

export interface IReverbProvider  extends IModule{
    createConnection(): Promise<void>;
    getReverbObserver$(): Subject<TReverbMessage<unknown>>
    onCloseApp(): void;
    closeConnections():void;
    sendMessage(event: string, dataToSend: {[key: string]: any}): void;
}
