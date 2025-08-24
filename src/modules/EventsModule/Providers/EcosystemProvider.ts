import type {IEcosystemProvider} from "@/modules/EventsModule/Interfaces/IEcosystemProvider.ts";
import {type App, onUnmounted} from "vue";
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
import type {TNotification} from "@/stores/Notifications/Types/TNotification.ts";
import type {TSendGift} from "@/stores/Ecosystem/Types/TSendGift.ts";
import type {TReplenishmentPopularity} from "@/modules/EventsModule/Types/TReplenishmentPopularity.ts";
import type {TUserAchievement} from "@/stores/Achievements/Types/TUserAchievement.ts";
import {achievementsStore} from "@/stores/Achievements/achievementsStore.ts";
import type {IAchievementsStore} from "@/stores/Achievements/IAchievementsStore.ts";

@injectable()
export class EcosystemProvider implements IEcosystemProvider{

    private _reverbObserver$: Subject<TReverbMessage<unknown>>;
    private dailyMissionsStore: Store<'dailyMissions', IDailyMissionsStore>;
    private achievementsStore: Store<'achievements', IAchievementsStore>;
    private ecosystemStore: Store<'ecosystem', IEcosystemStore>;

    constructor(
        @inject(ReverbSymbol)
        private reverbProvider: IReverbProvider,
        @inject(NotificationsSymbol)
        private notificationsProvider: INotificationsProvider
    ) {
        this._reverbObserver$ = this.reverbProvider.getReverbObserver$();
        this.dailyMissionsStore = dailyMissionsStore();
        this.achievementsStore = achievementsStore();
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
            filter((message):message is TReverbMessage<TUserAchievement> => message.event === 'achievement_progress'),
        ).subscribe((message) => {
            this.achievementsStore.$patch(state => {
                state.achievementList.forEach(a => {
                    if(a.id == message.data.id){
                        a.completed = message.data.completed;
                        a.received = message.data.received;
                        a.replays = message.data.replays;
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
            filter((message):message is TReverbMessage<TNotification> => message.event === 'show_notification'),
        ).subscribe((message) => {
            this.notificationsProvider.addNotification(message.data);
        });


        this._reverbObserver$.pipe(
            filter((message):message is TReverbMessage<TReplenishmentBalance> => message.event === 'replenishment_balance'),
        ).subscribe((message) => {
            this.ecosystemStore.$patch({
                balance: message.data.neoBalance
            })
        });

        this._reverbObserver$.pipe(
            filter((message):message is TReverbMessage<TReplenishmentPopularity> => message.event === 'replenishment_popularity'),
        ).subscribe((message) => {
            this.ecosystemStore.$patch({
                popularity: message.data.popularity,
                nextLevelPopularity: message.data.nextLevelPopularity,
                popularityLevel: message.data.popularityLevel,
            })
        });



        this._reverbObserver$.pipe(
            filter((message):message is TReverbMessage<TReplenishmentExperience> => message.event === 'replenishment_experience'),
        ).subscribe((message) => {
            if(this.ecosystemStore.$state.lvl < message.data.lvl){
                //todo: Показывать попап с повышением уровня
            }
            this.ecosystemStore.$patch({
                experience: message.data.experience,
                lvl: message.data.lvl,
                nextLevelExperience: message.data.nextLevelExperience
            })
        });


        this._reverbObserver$?.pipe(
            filter((message):message is TReverbMessage<TSendGift> => message.event === 'send_gift'),
        )?.subscribe((message) => {
            if(message.data.senderId == this.ecosystemStore.$state.id){
                const key = `${message.data.senderId}-${message.data.receiverId}-${message.data.quantity}-${message.data.gift.code}-${new Date()}`;
                this.notificationsProvider.addBigGift(key, message.data);
            }
        });

        this._reverbObserver$.pipe(
            filter((message):message is TReverbMessage<{day: keyof TDailyEnter, data: TDailyEnter}> => message.event === 'user_receive_daily_enter_box'),
        ).subscribe((message) => {
            this.ecosystemStore.$patch({
                dailyEnter: message.data.data,
                currentDay: message.data.day
            })
        });

        this._reverbObserver$.pipe(
            filter((message):message is TReverbMessage<any> => message.event === 'validateConnection'),
        ).subscribe((message) => {
            /*@ts-ignore*/
            if(this.ecosystemStore.$state.connectionId != message.activeConnection){
                this.notificationsProvider.addPopup('tab-is-unavailable', 'simple-popup', {
                    noClose: true,
                    noCloseButton: true,
                    backdropBlur: true,
                    darkBg: true,
                    title: 'Соединение разорвано',
                    message: 'Приложение открыто в другом окне или на другом устройстве',
                    modal: true
                });//todo: Окно с информацией о разрыве оформить в красивом стиле
                this.reverbProvider.closeConnections();
            }
        });


        this._reverbObserver$.pipe(
            filter((message):message is TReverbMessage<any> => message.event === 'user_profile_change'),
        ).subscribe((message) => {
            if(message?.data?.firstName){
                this.ecosystemStore.$patch({
                    firstName: message.data.firstName
                })
            }
            if(message?.data?.animal){
                this.ecosystemStore.$patch({
                    animal: message.data.animal
                })
            }
            if(message?.data?.sex){
                this.ecosystemStore.$patch({
                    sex: message.data.sex
                })
            }
            if(message?.data?.ageGroup){
                this.ecosystemStore.$patch({
                    ageGroup: message.data.ageGroup
                })
            }
        })

    }

}