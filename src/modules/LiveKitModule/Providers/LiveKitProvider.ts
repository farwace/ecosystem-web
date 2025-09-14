import type { ILiveKitProvider, IVoiceConnectionState } from "@/modules/LiveKitModule/Interfaces/ILiveKitProvider";
import type {App} from "vue";
import type {RoomOptions} from 'livekit-client';
import {
    Room,
    LocalAudioTrack,
    RemoteAudioTrack,
    RoomEvent,
    Track,
    Participant,
    DisconnectReason,
    ConnectionState,
    createLocalAudioTrack
} from 'livekit-client';

import {injectable, inject} from "inversify";

@injectable()
export class LiveKitProvider implements ILiveKitProvider{

    private room: Room | null = null;
    private localAudioTrack: LocalAudioTrack | null = null;
    private connectionState: IVoiceConnectionState = {
        isConnected: false,
        isConnecting: false,
        connectionError: null,
        isMicrophoneEnabled: false,
        participants: new Map()
    };

    // Event callbacks
    private onParticipantJoinedCallbacks: Array<(participant: Participant) => void> = [];
    private onParticipantLeftCallbacks: Array<(participant: Participant) => void> = [];
    private onConnectionStateChangedCallbacks: Array<(state: IVoiceConnectionState) => void> = [];
    private onErrorCallbacks: Array<(error: string) => void> = [];

    private isInitializing = false;
    private pendingOperations: Array<() => Promise<any>> = [];

    install(app: App, symbol: symbol) {
        app.provide(symbol, this);
    }

    async connectToVoiceRoom(token: string, roomUrl: string): Promise<boolean> {
        if (this.connectionState.isConnecting || this.connectionState.isConnected) {
            console.warn('>>> LiveKit >>> Already connecting or connected to voice room');
            return false;
        }

        try {
            this.isInitializing = true; // Добавь эту строку
            this.updateConnectionState({ isConnecting: true, connectionError: null });

            console.log('>>> LiveKit >>> LiveKitProvider: Connecting to room:', roomUrl);

            const roomOptions: RoomOptions = {
                adaptiveStream: true,
                dynacast: true,
                audioCaptureDefaults: {
                    autoGainControl: true,
                    echoCancellation: true,
                    noiseSuppression: true,
                },
            };

            this.room = new Room(roomOptions);
            this.setupRoomEventListeners();

            await this.room.connect(roomUrl, token);

            this.updateConnectionState({
                isConnected: true,
                isConnecting: false
            });

            console.log('>>> LiveKit >>> LiveKitProvider: Successfully connected to room');

            // Создаем локальный аудиотрек
            await this.createLocalAudioTrack();

            this.isInitializing = false; // Добавь эту строку

            // Обрабатываем отложенные операции
            await this.processPendingOperations(); // Добавь эту строку

            setTimeout(() => this.diagnoseAudioIssues(), 2000);

            return true;
        } catch (error) {
            this.isInitializing = false; // И эту тоже
            const errorMessage = `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
            console.error('>>> LiveKit >>> LiveKitProvider:', errorMessage);

            this.updateConnectionState({
                isConnecting: false,
                connectionError: errorMessage
            });

            this.emitError(errorMessage);
            return false;
        }
    }

    async disconnectFromVoiceRoom(): Promise<void> {
        console.log('>>> LiveKit >>> LiveKitProvider: Disconnecting from voice room');

        try {
            if (this.room) {
                await this.room.disconnect();
            }
        } catch (error) {
            console.error('>>> LiveKit >>> LiveKitProvider: Error during disconnect:', error);
        } finally {
            await this.cleanup();
        }
    }

    isConnectedToRoom(): boolean {
        return this.connectionState.isConnected;
    }

    async enableMicrophone(): Promise<boolean> {
        // Если еще инициализируемся, добавляем в очередь
        if (this.isInitializing) {
            console.log('>>> LiveKit >>> LiveKitProvider: Queuing microphone enable operation');
            this.pendingOperations.push(() => this.enableMicrophone());
            return true;
        }

        if (!this.room || !this.localAudioTrack) {
            console.error('>>> LiveKit >>> LiveKitProvider: Room or audio track not available');
            return false;
        }

        try {
            console.log('>>> LiveKit >>> LiveKitProvider: Enabling microphone...');

            await this.localAudioTrack.unmute();

            const existingPublication = this.room.localParticipant.getTrackPublication(Track.Source.Microphone);
            if (!existingPublication) {
                console.log('>>> LiveKit >>> Publishing audio track...');
                await this.room.localParticipant.publishTrack(this.localAudioTrack);
            }

            this.updateConnectionState({ isMicrophoneEnabled: true });
            console.log('>>> LiveKit >>> LiveKitProvider: Microphone enabled successfully');

            await this.diagnoseAudioIssues();

            return true;
        } catch (error) {
            const errorMessage = `Failed to enable microphone: ${error instanceof Error ? error.message : 'Unknown error'}`;
            console.error('>>> LiveKit >>> LiveKitProvider:', errorMessage);
            this.emitError(errorMessage);
            return false;
        }
    }

    async disableMicrophone(): Promise<boolean> {
        // Если еще инициализируемся, добавляем в очередь
        if (this.isInitializing) {
            console.log('>>> LiveKit >>> LiveKitProvider: Queuing microphone disable operation');
            this.pendingOperations.push(() => this.disableMicrophone());
            return true;
        }

        if (!this.room || !this.localAudioTrack) {
            console.error('>>> LiveKit >>> LiveKitProvider: Room or audio track not available');
            return false;
        }

        try {
            console.log('>>> LiveKit >>> LiveKitProvider: Disabling microphone...');

            await this.localAudioTrack.mute();

            this.updateConnectionState({ isMicrophoneEnabled: false });
            console.log('>>> LiveKit >>> LiveKitProvider: Microphone disabled successfully');
            return true;
        } catch (error) {
            const errorMessage = `Failed to disable microphone: ${error instanceof Error ? error.message : 'Unknown error'}`;
            console.error('>>> LiveKit >>> LiveKitProvider:', errorMessage);
            this.emitError(errorMessage);
            return false;
        }
    }

    async toggleMicrophone(): Promise<boolean> {
        if (this.connectionState.isMicrophoneEnabled) {
            return await this.disableMicrophone();
        } else {
            return await this.enableMicrophone();
        }
    }

    isMicrophoneActive(): boolean {
        return this.connectionState.isMicrophoneEnabled;
    }

    getConnectionState(): IVoiceConnectionState {
        return { ...this.connectionState };
    }

    getParticipants(): Map<string, Participant> {
        return new Map(this.connectionState.participants);
    }

    getRoom(): Room | null {
        return this.room;
    }

    onParticipantJoined(callback: (participant: Participant) => void): void {
        this.onParticipantJoinedCallbacks.push(callback);
    }

    onParticipantLeft(callback: (participant: Participant) => void): void {
        this.onParticipantLeftCallbacks.push(callback);
    }

    onConnectionStateChanged(callback: (state: IVoiceConnectionState) => void): void {
        this.onConnectionStateChangedCallbacks.push(callback);
    }

    onError(callback: (error: string) => void): void {
        this.onErrorCallbacks.push(callback);
    }

    async cleanup(): Promise<void> {
        console.log('>>> LiveKit >>> LiveKitProvider: Cleaning up resources');

        this.isInitializing = false; // Добавь эту строку
        this.pendingOperations = []; // И эту

        // Остановим локальный трек
        if (this.localAudioTrack) {
            this.localAudioTrack.stop();
            this.localAudioTrack = null;
        }

        // Очистим комнату
        this.room = null;

        // Сбросим состояние
        this.connectionState = {
            isConnected: false,
            isConnecting: false,
            connectionError: null,
            isMicrophoneEnabled: false,
            participants: new Map()
        };

        // Очистим callbacks
        this.clearAllCallbacks();
    }

    private async processPendingOperations(): Promise<void> {
        while (this.pendingOperations.length > 0) {
            const operation = this.pendingOperations.shift();
            if (operation) {
                try {
                    await operation();
                } catch (error) {
                    console.error('>>> LiveKit >>> LiveKitProvider: Error processing pending operation:', error);
                }
            }
        }
    }

    private isMediaDevicesSupported(): boolean {
        return !!(navigator &&
            navigator.mediaDevices &&
            navigator.mediaDevices.getUserMedia);
    }

    private async requestMicrophonePermission(): Promise<void> {
        try {
            // Предварительный запрос разрешения на доступ к микрофону
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // Сразу останавливаем, это только для получения разрешения
            stream.getTracks().forEach(track => track.stop());
            console.log('>>> LiveKit >>> LiveKitProvider: Microphone permission granted');
        } catch (error) {
            console.error('>>> LiveKit >>> LiveKitProvider: Microphone permission denied:', error);
            throw new Error('Microphone access denied. Please allow microphone access in browser settings.');
        }
    }

    private getOptimizedAudioOptions() {
        // Определяем настройки аудио в зависимости от устройства
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isIOS) {
            // Для iOS используем настройки, которые точно работают
            return {
                echoCancellation: true,
                noiseSuppression: false,
                autoGainControl: false,
                // Добавляем явные ограничения для iOS
                sampleRate: 48000,
                channelCount: 1,
            };
        } else if (isMobile) {
            // Для других мобильных устройств
            return {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: false,
                sampleRate: 48000,
                channelCount: 1,
            };
        } else {
            // Для десктопа полные настройки
            return {
                autoGainControl: true,
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 48000,
                channelCount: 1,
            };
        }
    }

    // Private methods
    private async createLocalAudioTrack(): Promise<void> {
        try {
            if (this.localAudioTrack) {
                return; // Трек уже создан
            }

            // Проверяем поддержку медиа API
            if (!this.isMediaDevicesSupported()) {
                throw new Error('MediaDevices API not supported on this device');
            }

            // Запрашиваем разрешения на микрофон с fallback для мобильных устройств
            await this.requestMicrophonePermission();

            console.log('>>> LiveKit >>> LiveKitProvider: Creating local audio track...');

            // Создаем трек с настройками, оптимизированными для мобильных устройств
            const audioOptions = this.getOptimizedAudioOptions();
            this.localAudioTrack = await createLocalAudioTrack(audioOptions);

            console.log('>>> LiveKit >>> LiveKitProvider: Local audio track created successfully');
        } catch (error) {
            const errorMessage = `Failed to create audio track: ${error instanceof Error ? error.message : 'Unknown error'}`;
            console.error('>>> LiveKit >>> LiveKitProvider:', errorMessage, error);
            this.emitError(errorMessage);

            // Попытка создать простой трек без дополнительных опций
            await this.createFallbackAudioTrack();
        }
    }

    private async createFallbackAudioTrack(): Promise<void> {
        try {
            console.log('>>> LiveKit >>> LiveKitProvider: Trying fallback audio track creation...');

            // Создаем максимально простой трек без дополнительных опций
            this.localAudioTrack = await createLocalAudioTrack({
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false,
            });

            console.log('>>> LiveKit >>> LiveKitProvider: Fallback audio track created');
        } catch (fallbackError) {
            console.error('>>> LiveKit >>> LiveKitProvider: Fallback audio track creation also failed:', fallbackError);
            throw fallbackError;
        }
    }

    private async diagnoseAudioIssues(): Promise<void> {
        console.log('>>> LiveKit >>> LiveKitProvider: Diagnosing audio issues...');

        if (!this.localAudioTrack) {
            console.log('>>> LiveKit >>> No local audio track available');
            return;
        }

        // Проверяем состояние трека
        console.log('>>> LiveKit >>> Track enabled:', this.localAudioTrack.mediaStreamTrack.enabled);
        console.log('>>> LiveKit >>> Track muted:', this.localAudioTrack.isMuted);
        console.log('>>> LiveKit >>> Track readyState:', this.localAudioTrack.mediaStreamTrack.readyState);

        // Проверяем настройки трека
        const settings = this.localAudioTrack.mediaStreamTrack.getSettings();
        console.log('>>> LiveKit >>> Track settings:', settings);

        // Проверяем, опубликован ли трек - используем правильный способ
        if (this.room) {
            const publication = this.room.localParticipant.getTrackPublication(Track.Source.Microphone);
            console.log('>>> LiveKit >>> Track published:', !!publication);
            if (publication) {
                console.log('>>> LiveKit >>> Publication muted:', publication.isMuted);
            }
        }
    }

    private setupRoomEventListeners(): void {
        if (!this.room) return;

        // Участник подключился
        this.room.on(RoomEvent.ParticipantConnected, (participant: Participant) => {
            console.log('>>> LiveKit >>> LiveKitProvider: Participant connected:', participant.identity);

            this.connectionState.participants.set(participant.identity, participant);
            this.emitConnectionStateChanged();
            this.emitParticipantJoined(participant);

            // Подписываемся на аудиотреки участника
            participant.audioTrackPublications.forEach((publication) => {
                if (publication.track) {
                    this.handleRemoteAudioTrack(publication.track as RemoteAudioTrack, participant);
                }
            });

            // Слушаем новые треки
            participant.on('trackSubscribed', (track) => {
                if (track.kind === Track.Kind.Audio) {
                    this.handleRemoteAudioTrack(track as RemoteAudioTrack, participant);
                }
            });
        });

        // Участник отключился
        this.room.on(RoomEvent.ParticipantDisconnected, (participant: Participant) => {
            console.log('>>> LiveKit >>> LiveKitProvider: Participant disconnected:', participant.identity);

            this.connectionState.participants.delete(participant.identity);
            this.emitConnectionStateChanged();
            this.emitParticipantLeft(participant);
        });

        // Комната отключилась
        this.room.on(RoomEvent.Disconnected, async (reason?: DisconnectReason) => {
            console.log('>>> LiveKit >>> LiveKitProvider: Room disconnected:', reason);
            await this.cleanup();
            this.emitConnectionStateChanged();
        });

        // Изменения состояния подключения
        this.room.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
            console.log('>>> LiveKit >>> LiveKitProvider: Connection state changed:', state);

            if (state === ConnectionState.Disconnected) {
                this.updateConnectionState({
                    isConnected: false,
                    connectionError: 'Connection lost'
                });
            }
        });

        // Ошибки
        this.room.on(RoomEvent.ConnectionQualityChanged, (quality, participant) => {
            console.log(`LiveKitProvider: Connection quality for ${participant?.identity}: ${quality}`);
        });
    }

    private handleRemoteAudioTrack(track: RemoteAudioTrack, participant: Participant): void {
        console.log(`LiveKitProvider: Handling remote audio from ${participant.identity}`);

        const audioElement = track.attach() as HTMLAudioElement;
        audioElement.autoplay = true;
        // Правильная типизация для playsInline
        (audioElement as any).playsInline = true;

        // Добавляем в скрытый контейнер в DOM
        const container = this.getOrCreateAudioContainer();
        container.appendChild(audioElement);

        // Удаляем при завершении трека
        track.on('ended', () => {
            audioElement.remove();
        });
    }

    private getOrCreateAudioContainer(): HTMLElement {
        let container = document.getElementById('livekit-audio-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'livekit-audio-container';
            container.style.display = 'none';
            document.body.appendChild(container);
        }
        return container;
    }

    private updateConnectionState(updates: Partial<IVoiceConnectionState>): void {
        this.connectionState = { ...this.connectionState, ...updates };
        this.emitConnectionStateChanged();
    }

    private emitParticipantJoined(participant: Participant): void {
        this.onParticipantJoinedCallbacks.forEach(callback => {
            try {
                callback(participant);
            } catch (error) {
                console.error('>>> LiveKit >>> LiveKitProvider: Error in participant joined callback:', error);
            }
        });
    }

    private emitParticipantLeft(participant: Participant): void {
        this.onParticipantLeftCallbacks.forEach(callback => {
            try {
                callback(participant);
            } catch (error) {
                console.error('>>> LiveKit >>> LiveKitProvider: Error in participant left callback:', error);
            }
        });
    }

    private emitConnectionStateChanged(): void {
        const state = this.getConnectionState();
        this.onConnectionStateChangedCallbacks.forEach(callback => {
            try {
                callback(state);
            } catch (error) {
                console.error('>>> LiveKit >>> LiveKitProvider: Error in connection state callback:', error);
            }
        });
    }

    private emitError(error: string): void {
        this.onErrorCallbacks.forEach(callback => {
            try {
                callback(error);
            } catch (error) {
                console.error('>>> LiveKit >>> LiveKitProvider: Error in error callback:', error);
            }
        });
    }

    private clearAllCallbacks(): void {
        this.onParticipantJoinedCallbacks = [];
        this.onParticipantLeftCallbacks = [];
        this.onConnectionStateChangedCallbacks = [];
        this.onErrorCallbacks = [];
    }
}