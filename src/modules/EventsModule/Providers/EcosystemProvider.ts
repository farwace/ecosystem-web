import type {IEcosystemProvider} from "@/modules/EventsModule/Interfaces/IEcosystemProvider.ts";
import type {App} from "vue";
import {inject, injectable} from "inversify";
import {ReverbSymbol} from "@/modules/ReverbModule/symbols.ts";
import type {IReverbProvider} from "@/modules/ReverbModule/Interfaces/IReverbProvider.ts";
import {filter, type Subject} from "rxjs";
import type {TReverbMessage} from "@/modules/ReverbModule/Types/TReverbMessage.ts";
import type {IDailyMissionsStore} from "@/stores/DailyMissions/IDailyMissionsStore.ts";
import type {Store} from "pinia";
import {dailyMissionsStore} from "@/stores/DailyMissions/dailyMissionsStore.ts";
import type {TDailyMission} from "@/stores/Ecosystem/Types/TDailyMission.ts";
import {NotificationsSymbol} from "@/modules/NotificationsModule/symbols.ts";
import type {INotificationsProvider} from "@/modules/NotificationsModule/Interfaces/INotificationsProvider.ts";
import type {TReplenishmentBalance} from "@/modules/EventsModule/Types/TReplenishmentBalance.ts";
import type {IEcosystemStore} from "@/stores/Ecosystem/IEcosystemStore.ts";
import {ecosystemStore} from "@/stores/Ecosystem/ecosystemStore.ts";
import type {TReplenishmentExperience} from "@/modules/EventsModule/Types/TReplenishmentExperience.ts";
import type {TDailyEnter} from "@/stores/Ecosystem/Types/TDailyEnter.ts";

@injectable()
export class EcosystemProvider implements IEcosystemProvider{

    private _reverbObserver$: Subject<TReverbMessage<unknown>>;
    private dailyMissionsStore: Store<'dailyMissions', IDailyMissionsStore>;
    private ecosystemStore: Store<'ecosystem', IEcosystemStore>;

    constructor(
        @inject(ReverbSymbol)
        private reverbProvider: IReverbProvider,
        @inject(NotificationsSymbol)
        private notificationsProvider: INotificationsProvider
    ) {
        this._reverbObserver$ = this.reverbProvider.getReverbObserver$();
        this.dailyMissionsStore = dailyMissionsStore();
        this.ecosystemStore = ecosystemStore();
    }

    install(app: App, symbol: symbol) {
        app.provide(symbol, this);
        this.subscribeToEcosystemEvents();
    }

    private subscribeToEcosystemEvents = () => {

        this._reverbObserver$.pipe(
            filter((message):message is TReverbMessage<TDailyMission> => message.event === 'daily_mission_progress'),
        ).subscribe((message) => {
            this.dailyMissionsStore.$patch((state) => {
                state.dailyMissionList.forEach(m => {
                    if(m.id == message.data.id){
                        m.completed = message.data.completed;
                        m.received = message.data.received;
                        m.replays = message.data.replays;
                    }
                })
            })
        });

        this._reverbObserver$.pipe(
            filter((message):message is TReverbMessage<any> => message.event === 'show_popup'),
        ).subscribe((message) => {
            this.notificationsProvider.addPopup(message.data.key, message.data.componentName, message.data.ppData);
        });

        this._reverbObserver$.pipe(
            filter((message):message is TReverbMessage<TReplenishmentBalance> => message.event === 'replenishment_balance'),
        ).subscribe((message) => {
            this.ecosystemStore.$patch({
                balance: message.data.neoBalance
            })
        });

        this._reverbObserver$.pipe(
            filter((message):message is TReverbMessage<TReplenishmentExperience> => message.event === 'replenishment_experience'),
        ).subscribe((message) => {
            this.ecosystemStore.$patch({
                experience: message.data.experience,
                lvl: message.data.lvl,
                nextLevelExperience: message.data.nextLevelExperience
            })
        });

        this._reverbObserver$.pipe(
            filter((message):message is TReverbMessage<{day: keyof TDailyEnter, data: TDailyEnter}> => message.event === 'user_receive_daily_enter_box'),
        ).subscribe((message) => {
            this.ecosystemStore.$patch({
                dailyEnter: message.data.data,
                currentDay: message.data.day
            })
        });


    }

}