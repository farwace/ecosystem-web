import {injectable} from 'inversify';
import {Subject} from 'rxjs';
import type {App} from 'vue';
import type {ReceiveDataMap, VKBridgeEvent} from '@vkontakte/vk-bridge';
import type {IPlatformEvents} from '../Interfaces/IPlatformEvents';

@injectable()
export class WebEventsProvider implements IPlatformEvents {
    private events = new Subject<VKBridgeEvent<keyof ReceiveDataMap>>();
    private ecosystemEvents = new Subject<any>();
    install(app: App, symbol: symbol) { app.provide(symbol, this); }
    async init() {
        if (this.isDesktop()) document.documentElement.setAttribute('desktop', '1');
    }
    getEmitter = () => this.events;
    getEcosystemEmitter = () => this.ecosystemEvents;
    setApplicationIsReady = async () => {};
    setApplicationLoadError = async () => {};
    isDesktop = () => window.matchMedia('(pointer: fine)').matches;
    inviteFriendToGame = async (roomId?: string, gameCode?: string) => {
        const url = new URL(gameCode === 'bunker' ? '/games/bunker' : '/', window.location.origin);
        if (roomId) url.searchParams.set('room_id', roomId);
        try {
            if (navigator.share) await navigator.share({title: 'LAPA PLAY', url: url.href});
            else {
                await navigator.clipboard.writeText(url.href);
                this.ecosystemEvents.next({type: 'show-warning', message: 'Ссылка скопирована'});
            }
        } catch (error) {
            if (!(error instanceof DOMException && error.name === 'AbortError')) {
                window.prompt('Скопируйте ссылку-приглашение', url.href);
            }
        }
    };
    private unavailable = async () => {
        this.ecosystemEvents.next({type: 'show-warning', message: 'Эта функция пока доступна только во ВКонтакте.'});
    };
    buySubscription = this.unavailable;
    buyMoney = this.unavailable;
    getAuthToken = async () => undefined;
    displayBottomBn = () => {};
    removeBottomBn = () => {};
    checkRewardNativeAdds = () => {};
    allowNotifications = () => {};
    showRewardAdds = async () => false;
    finishRewardAdds = () => {};
    addToFavorite = () => {};
    addToRecommended = () => {};
    showSlidesSheet = () => {};
    startRewardAdds = () => {};
    showStoryBox = this.unavailable;
    checkAchievement = () => {};
    queryFriends = async () => [];
}
