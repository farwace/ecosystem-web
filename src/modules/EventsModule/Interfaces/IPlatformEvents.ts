import {Subject} from "rxjs";
import type {ReceiveDataMap, VKBridgeEvent} from "@vkontakte/vk-bridge";

export interface IPlatformEvents {
    init: () => Promise<void>;
    getEmitter: () => Subject<VKBridgeEvent<keyof ReceiveDataMap>>;
    setApplicationIsReady: () => Promise<any>;
}