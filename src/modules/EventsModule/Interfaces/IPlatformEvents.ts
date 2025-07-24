import {Subject} from "rxjs";
import type {ReceiveDataMap, VKBridgeEvent} from "@vkontakte/vk-bridge";
import type {IModule} from "@/modules/IModule.ts";

export interface IPlatformEvents extends IModule{
    init: () => Promise<void>;
    getEmitter: () => Subject<VKBridgeEvent<keyof ReceiveDataMap>>;
    setApplicationIsReady: () => Promise<any>;
    setApplicationLoadError: () => Promise<any>;
}