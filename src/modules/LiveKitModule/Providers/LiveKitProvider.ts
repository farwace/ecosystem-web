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

    install(app: App, symbol: symbol) {
        app.provide(symbol, this);
    }

    async connectToVoiceRoom(token: string, roomUrl: string): Promise<boolean> {
        if (this.connectionState.isConnecting || this.connectionState.isConnected) {
            console.warn('Already connecting or connected to voice room');
            return false;
        }

        try {
            this.updateConnectionState({ isConnecting: true, connectionError: null });

            console.log('LiveKitProvider: Connecting to room:', roomUrl);

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

            console.log('LiveKitProvider: Successfully connected to room');

            // Создаем локальный аудиотрек
            await this.createLocalAudioTrack();

            return true;
        } catch (error) {
            const errorMessage = `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
            console.error('LiveKitProvider:', errorMessage);

            this.updateConnectionState({
                isConnecting: false,
                connectionError: errorMessage
            });

            this.emitError(errorMessage);
            return false;
        }
    }

    async disconnectFromVoiceRoom(): Promise<void> {
        console.log('LiveKitProvider: Disconnecting from voice room');

        try {
            if (this.room) {
                await this.room.disconnect();
            }
        } catch (error) {
            console.error('LiveKitProvider: Error during disconnect:', error);
        } finally {
            await this.cleanup();
        }
    }

    isConnectedToRoom(): boolean {
        return this.connectionState.isConnected;
    }

    async enableMicrophone(): Promise<boolean> {
        if (!this.room || !this.localAudioTrack) {
            console.error('LiveKitProvider: Room or audio track not available');
            return false;
        }

        try {
            await this.localAudioTrack.unmute();
            await this.room.localParticipant.publishTrack(this.localAudioTrack);

            this.updateConnectionState({ isMicrophoneEnabled: true });
            console.log('LiveKitProvider: Microphone enabled');
            return true;
        } catch (error) {
            const errorMessage = `Failed to enable microphone: ${error instanceof Error ? error.message : 'Unknown error'}`;
            console.error('LiveKitProvider:', errorMessage);
            this.emitError(errorMessage);
            return false;
        }
    }

    async disableMicrophone(): Promise<boolean> {
        if (!this.room || !this.localAudioTrack) {
            console.error('LiveKitProvider: Room or audio track not available');
            return false;
        }

        try {
            await this.room.localParticipant.unpublishTrack(this.localAudioTrack);
            await this.localAudioTrack.mute();

            this.updateConnectionState({ isMicrophoneEnabled: false });
            console.log('LiveKitProvider: Microphone disabled');
            return true;
        } catch (error) {
            const errorMessage = `Failed to disable microphone: ${error instanceof Error ? error.message : 'Unknown error'}`;
            console.error('LiveKitProvider:', errorMessage);
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
        console.log('LiveKitProvider: Cleaning up resources');

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

    // Private methods
    private async createLocalAudioTrack(): Promise<void> {
        try {
            if (this.localAudioTrack) {
                return; // Трек уже создан
            }

            this.localAudioTrack = await createLocalAudioTrack({
                autoGainControl: true,
                echoCancellation: true,
                noiseSuppression: true,
            });

            console.log('LiveKitProvider: Local audio track created');
        } catch (error) {
            const errorMessage = `Failed to create audio track: ${error instanceof Error ? error.message : 'Unknown error'}`;
            console.error('LiveKitProvider:', errorMessage);
            this.emitError(errorMessage);
        }
    }

    private setupRoomEventListeners(): void {
        if (!this.room) return;

        // Участник подключился
        this.room.on(RoomEvent.ParticipantConnected, (participant: Participant) => {
            console.log('LiveKitProvider: Participant connected:', participant.identity);

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
            console.log('LiveKitProvider: Participant disconnected:', participant.identity);

            this.connectionState.participants.delete(participant.identity);
            this.emitConnectionStateChanged();
            this.emitParticipantLeft(participant);
        });

        // Комната отключилась
        this.room.on(RoomEvent.Disconnected, async (reason?: DisconnectReason) => {
            console.log('LiveKitProvider: Room disconnected:', reason);
            await this.cleanup();
            this.emitConnectionStateChanged();
        });

        // Изменения состояния подключения
        this.room.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
            console.log('LiveKitProvider: Connection state changed:', state);

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
                console.error('LiveKitProvider: Error in participant joined callback:', error);
            }
        });
    }

    private emitParticipantLeft(participant: Participant): void {
        this.onParticipantLeftCallbacks.forEach(callback => {
            try {
                callback(participant);
            } catch (error) {
                console.error('LiveKitProvider: Error in participant left callback:', error);
            }
        });
    }

    private emitConnectionStateChanged(): void {
        const state = this.getConnectionState();
        this.onConnectionStateChangedCallbacks.forEach(callback => {
            try {
                callback(state);
            } catch (error) {
                console.error('LiveKitProvider: Error in connection state callback:', error);
            }
        });
    }

    private emitError(error: string): void {
        this.onErrorCallbacks.forEach(callback => {
            try {
                callback(error);
            } catch (error) {
                console.error('LiveKitProvider: Error in error callback:', error);
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