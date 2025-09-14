import type {IModule} from "@/modules/IModule.ts";
import type { Room, LocalAudioTrack, Participant } from 'livekit-client';

export interface IVoiceConnectionState {
    isConnected: boolean;
    isConnecting: boolean;
    connectionError: string | null;
    isMicrophoneEnabled: boolean;
    participants: Map<string, Participant>;
}

export interface ILiveKitProvider extends IModule{
    // Connection management
    connectToVoiceRoom(token: string, roomUrl: string): Promise<boolean>;
    disconnectFromVoiceRoom(): Promise<void>;
    isConnectedToRoom(): boolean;

    // Audio management
    enableMicrophone(): Promise<boolean>;
    disableMicrophone(): Promise<boolean>;
    toggleMicrophone(): Promise<boolean>;
    isMicrophoneActive(): boolean;

    // State getters
    getConnectionState(): IVoiceConnectionState;
    getParticipants(): Map<string, Participant>;
    getRoom(): Room | null;

    // Event handlers
    onParticipantJoined(callback: (participant: Participant) => void): void;
    onParticipantLeft(callback: (participant: Participant) => void): void;
    onConnectionStateChanged(callback: (state: IVoiceConnectionState) => void): void;
    onError(callback: (error: string) => void): void;

    // Cleanup
    cleanup(): Promise<void>;
}