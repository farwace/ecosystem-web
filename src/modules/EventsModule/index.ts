import type {IPlatformEvents} from "@/modules/EventsModule/Interfaces/IPlatformEvents";
import {PlatformEventsSymbol} from "@/modules/EventsModule/symbols";
import type {App} from "vue";
import type {IModule} from "@/modules/IModule";

export class EventsModule implements IModule{
    constructor(
        private PlatformEvents:IPlatformEvents
    ) {
    }

    install(app: App){
        app.provide(PlatformEventsSymbol, this.PlatformEvents)
    }
}