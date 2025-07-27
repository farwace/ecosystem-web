import type {IEcosystemProvider} from "@/modules/EventsModule/Interfaces/IEcosystemProvider.ts";
import type {App} from "vue";
import {inject, injectable} from "inversify";
import {ReverbSymbol} from "@/modules/ReverbModule/symbols.ts";
import type {IReverbProvider} from "@/modules/ReverbModule/Interfaces/IReverbProvider.ts";
import {filter, type Subject} from "rxjs";
import type {TReverbMessage} from "@/modules/ReverbModule/Types/TReverbMessage.ts";
import {Console} from "@/classes/utils/Console.ts";
import type {IDailyMissionsStore} from "@/stores/DailyMissions/IDailyMissionsStore.ts";
import type {Store} from "pinia";
import {dailyMissionsStore} from "@/stores/DailyMissions/dailyMissionsStore.ts";
import type {TDailyMission} from "@/stores/Ecosystem/Types/TDailyMission.ts";

@injectable()
export class EcosystemProvider implements IEcosystemProvider{

    private _reverbObserver$: Subject<TReverbMessage<unknown>>;
    private dailyMissionsStore: Store<'dailyMissions', IDailyMissionsStore>;

    constructor(
        @inject(ReverbSymbol)
        private reverbProvider: IReverbProvider,
    ) {
        this._reverbObserver$ = this.reverbProvider.getReverbObserver$();
        this.dailyMissionsStore = dailyMissionsStore();
    }

    install(app: App, symbol: symbol) {
        app.provide(symbol, this);
        this.subscribeToDailyMissionEvents();
    }

    private subscribeToDailyMissionEvents = () => {
        this._reverbObserver$.pipe(
            filter((message):message is TReverbMessage<TDailyMission> => message.event === 'daily_mission_progress'),
        ).subscribe((message) => {
            console.log('>>> Daily Mission Progress:', message);
            this.dailyMissionsStore.$patch((state) => {
                state.dailyMissionList.forEach(m => {
                    if(m.id == message.data.id){
                        m.completed = message.data.completed;
                        m.received = message.data.received;
                        m.replays = message.data.replays;
                    }
                })
            })
        })
    }
}