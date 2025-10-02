<template>
  <div class="voice-chat">
    <BunkerButton class="button" v-if="canISpeak" @click="toggleMicrophone">
      <template v-if="!isMicrophoneSupports()">
        <div class="btn-content"><span>🚫</span><span>Микрофон недоступен</span></div>
      </template>
      <template v-else>
        <div class="btn-content" v-if="isConnecting"><span>⏳</span><span>Подключе ние…</span></div>
        <div class="btn-content" v-else-if="isMicEnabled"><span>🎤</span><span>Микрофон включён</span></div>
        <div class="btn-content" v-else><span>🔇</span><span>Микрофон выключен</span></div>
      </template>
    </BunkerButton>

    <!-- сюда будут цепляться <audio> -->
    <div ref="audioContainer" style="display:none;"></div>
  </div>
</template>

<script lang="ts" setup>
import {ref, onMounted, onBeforeUnmount, watch, inject} from "vue";
import {
  Room,
  RoomEvent,
  RemoteTrack,
  RemoteParticipant,
  LocalAudioTrack,
  Participant,
} from "livekit-client";

import type {INotificationsProvider} from "@/modules/NotificationsModule/Interfaces/INotificationsProvider.ts";
import {NotificationsSymbol} from "@/modules/NotificationsModule/symbols.ts";
import {Console} from "@/classes/utils/Console.ts";
import BunkerButton from "@/components/games/bunker/components/BunkerButton.vue";
import {storeToRefs} from "pinia";
import {gameStore} from "@/stores/Game/gameStore.ts";
import {themeStore} from "@/stores/Theme/themeStore.ts";
import {VersionComparator} from "@/classes/utils/VersionComparator.ts";
import {ecosystemStore} from "@/stores/Ecosystem/ecosystemStore.ts";
import UiIcon from "@/components/common/icons/UiIcon.vue";

const notificationsProvider: INotificationsProvider | undefined = inject(NotificationsSymbol);
const {isHidden} = storeToRefs(gameStore());
const { clientInfo } = storeToRefs(themeStore());
const { platform } = storeToRefs(ecosystemStore());

const props = defineProps<{
  liveKitToken: string;
  liveKitRoomName: string;
  canISpeak: boolean;
}>();

const emit = defineEmits<{
  (e: "volumesUpdate", volumes: Record<string, number>): void;
}>();

const isMicEnabled = ref(false);
const isConnecting = ref(false);
let room: Room | null = null;
let localAudioTrack: LocalAudioTrack | null = null;
const audioContainer = ref<HTMLDivElement | null>(null);

// 🔊 текущие громкости
const volumes: Record<string, number> = {};
const prevVolumes: Record<string, number> = {};
const amplifyFactor = 10;
const minDiff = 0.02;
let emitTimer: number | null = null;

// список <audio> элементов для remote
const remoteAudioElements: HTMLAudioElement[] = [];

const volumeMonitorDisposers = new Map<string, () => void>();
let connectPromise: Promise<void> | null = null;
let repairPromise: Promise<void> | null = null;

function emitVolumesNow(force = false) {
  let changed = force;
  const out: Record<string, number> = {};

  for (const [id, val] of Object.entries(volumes)) {
    const prev = prevVolumes[id] ?? -1;
    out[id] = val;
    if (!changed && Math.abs(val - prev) > minDiff) {
      changed = true;
    }
  }

  if (!changed) return;

  emit("volumesUpdate", out);
  Object.assign(prevVolumes, out);
}

function startVolumeMonitor(track: MediaStreamTrack, identity: string) {
  stopVolumeMonitor(identity);
  const dispose = monitorVolume(track, identity);
  volumeMonitorDisposers.set(identity, dispose);
}

function stopVolumeMonitor(identity: string) {
  const dispose = volumeMonitorDisposers.get(identity);
  if (dispose) {
    dispose();
    volumeMonitorDisposers.delete(identity);
  }
}

function stopAllVolumeMonitors() {
  volumeMonitorDisposers.forEach((dispose) => dispose());
  volumeMonitorDisposers.clear();
}

function monitorVolume(track: MediaStreamTrack, identity: string) {
  const audioCtx = new AudioContext();
  const stream = new MediaStream([track]);
  const source = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 512;
  source.connect(analyser);

  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  let rafId: number | null = null;
  let disposed = false;

  function update() {
    if (disposed) return;
    analyser.getByteTimeDomainData(dataArray);

    let sumSquares = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const val = (dataArray[i] - 128) / 128;
      sumSquares += val * val;
    }
    const rms = Math.sqrt(sumSquares / dataArray.length);

    const amplified = Math.min(1, rms * amplifyFactor);

    volumes[identity] = amplified;

    rafId = requestAnimationFrame(update);
  }

  update();

  return () => {
    disposed = true;
    if (rafId !== null) cancelAnimationFrame(rafId);
    try {
      source.disconnect();
      analyser.disconnect();
    } catch (e) {
      Console.error(">>> VoiceChat.vue >>> Ошибка остановки мониторинга громкости", e);
    }
    audioCtx.close().catch(() => undefined);
  };
}

async function connectToRoom() {
  if (!props.liveKitToken || !props.liveKitRoomName) return;
  if (room) return;
  if (connectPromise) {
    await connectPromise;
    return;
  }

  isConnecting.value = true;

  connectPromise = (async () => {
    const newRoom = new Room();

    newRoom.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, pub, participant: RemoteParticipant) => {
      if (track.kind === "audio") {
        const audioEl = track.attach() as HTMLAudioElement;
        audioEl.autoplay = true;
        audioEl.controls = false;
        audioContainer.value?.appendChild(audioEl);

        remoteAudioElements.push(audioEl);

        addParticipant(participant);
        startVolumeMonitor(track.mediaStreamTrack, participant.identity);
      }
    });

    newRoom.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack, pub, participant: RemoteParticipant) => {
      track.detach().forEach((el) => {
        const idx = remoteAudioElements.indexOf(el as HTMLAudioElement);
        if (idx !== -1) remoteAudioElements.splice(idx, 1);
        el.remove();
      });
      stopVolumeMonitor(participant.identity);
      removeParticipant(participant.identity);
    });

    newRoom.on(RoomEvent.ParticipantDisconnected, (participant) => {
      stopVolumeMonitor(participant.identity);
      removeParticipant(participant.identity);
    });

    newRoom.on(RoomEvent.Disconnected, () => {
      disconnectFromRoom({ clearLocalTrack: false, disconnectRoom: false }).catch((e) => {
        Console.error(">>> VoiceChat.vue >>> Ошибка очистки после дисконнекта", e);
      });
    });

    try {
      await newRoom.connect(import.meta.env.VITE_LIVEKIT_URL, props.liveKitToken);
    } catch (error) {
      Console.error(">>> VoiceChat.vue >>> Ошибка подключения к LiveKit", error);
      throw error;
    }

    room = newRoom;

    addParticipant(newRoom.localParticipant);

    // 🔁 эмит 20 раз/сек
    emitTimer = window.setInterval(() => {
      emitVolumesNow();
    }, 50);

    if (props.canISpeak && !isHidden.value) {
      await enableMicrophone();
    }
    isConnecting.value = false;
  })();

  try {
    await connectPromise;
  } finally {
    connectPromise = null;
    if (!room) {
      isConnecting.value = false;
    }
  }
}

function addParticipant(p: Participant) {
  if (!volumes[p.identity]) {
    volumes[p.identity] = 0;
    prevVolumes[p.identity] = 0;
  }
}

function removeParticipant(identity: string) {
  stopVolumeMonitor(identity);
  delete volumes[identity];
  delete prevVolumes[identity];
  emitVolumesNow(true);
}

async function enableMicrophone(manually = false) {
  if(!isMicrophoneSupports()){
    notificationsProvider?.addPopup('microphone-is-not-available', 'simple-popup', {
      title: 'Включение микрофона недоступно',
      message: 'Данная функция временно отключена на IPhone.<br/><br/>Подробнее в <a target="_blank" href="https://vk.com/wall-232362939_3">официальной группе Лапа Play</a>'
    });
    return;
  }
  if (!room) return;
  if (isHidden.value) return;

  try {
    if (!localAudioTrack) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const track = stream.getTracks()[0];
      localAudioTrack = new LocalAudioTrack(track);
      await room.localParticipant.publishTrack(localAudioTrack);
    }
    if (localAudioTrack.isMuted) {
      await localAudioTrack.unmute();
    }
    if (localAudioTrack.mediaStreamTrack) {
      startVolumeMonitor(localAudioTrack.mediaStreamTrack, room.localParticipant.identity);
    }
    isMicEnabled.value = true;
  } catch (e: any) {
    Console.error(">>> VoiceChat.vue >>> Ошибка включения микрофона:", e);
    if(manually){
      notificationsProvider?.addPopup('microphone-is-not-available', 'microphone-is-not-available-popup', {
        title: 'Ошибка включения микрофона',
      })
    }
  }
}

async function disableMicrophone() {
  if (!room || !localAudioTrack) return;
  if (!localAudioTrack.isMuted) {
    await localAudioTrack.mute();
  }
  stopVolumeMonitor(room.localParticipant.identity);
  volumes[room.localParticipant.identity] = 0;
  delete prevVolumes[room.localParticipant.identity];
  emitVolumesNow(true);
  isMicEnabled.value = false;
}

async function toggleMicrophone() {
  if (!props.canISpeak) {
    notificationsProvider?.addNotification({
      type: "game-info",
      message: "Нельзя говорить в текущий момент",
    });
  }

  if (isMicEnabled.value) {
    await disableMicrophone();
  } else {
    await enableMicrophone(true);
  }
}

// 🔇 mute/unmute всех входящих дорожек
const muteAll = () => {
  disableMicrophone();
  remoteAudioElements.forEach((el) => (el.muted = true));
};
const unmuteAll = () => {
  remoteAudioElements.forEach((el) => (el.muted = false));
};

async function disconnectFromRoom(options: { clearLocalTrack?: boolean; disconnectRoom?: boolean } = {}) {
  const { clearLocalTrack = true, disconnectRoom = true } = options;

  if (emitTimer) {
    clearInterval(emitTimer);
    emitTimer = null;
  }

  stopAllVolumeMonitors();

  Object.keys(volumes).forEach((id) => delete volumes[id]);
  Object.keys(prevVolumes).forEach((id) => delete prevVolumes[id]);
  emitVolumesNow(true);

  remoteAudioElements.splice(0, remoteAudioElements.length).forEach((el) => {
    el.srcObject = null;
    el.remove();
  });

  if (room && disconnectRoom) {
    try {
      room.removeAllListeners();
      await room.disconnect();
    } catch (e) {
      Console.error(">>> VoiceChat.vue >>> Ошибка при отключении от LiveKit", e);
    }
  }

  room = null;
  isConnecting.value = false;

  if (clearLocalTrack && localAudioTrack) {
    try {
      localAudioTrack.stop();
    } catch (e) {
      Console.error(">>> VoiceChat.vue >>> Ошибка остановки локального трека", e);
    }
    localAudioTrack = null;
  }

  isMicEnabled.value = false;
}

async function repairAudio() {
  if (repairPromise) {
    return repairPromise;
  }

  repairPromise = (async () => {
    await disconnectFromRoom();
    await connectToRoom();
  })();

  try {
    await repairPromise;
  } finally {
    repairPromise = null;
  }
}

watch(() => props.canISpeak, async (canISpeak) => {
  if (canISpeak) {
    await enableMicrophone();
  } else {
    await disableMicrophone();
  }
});

watch(isHidden, (neoVal) => {
  if (neoVal) {
    muteAll();
  } else {
    unmuteAll();
  }
});

const isMicrophoneSupports = () => {
  return true;
}

onMounted(() => {
  connectToRoom();
});

onBeforeUnmount(() => {
  disconnectFromRoom().catch((e) => {
    Console.error(">>> VoiceChat.vue >>> Ошибка очистки при размонтировании", e);
  });
});

defineExpose({
  repairAudio,
});
</script>

<style scoped>
.voice-chat {
  :deep(.game-btn__content) {
    padding: 5px 10px;
  }
  .button {
    background: #444;
    color: white;
    border: none;
    line-height: 14px;

    .btn-content {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      gap: 2px;
    }
  }
}
</style>
