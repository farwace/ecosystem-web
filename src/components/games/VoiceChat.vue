<template>
  <div class="voice-chat">
    <BunkerButton class="button" v-if="canISpeak" @click="toggleMicrophone">
      <template v-if="!isMicrophoneSupports()">
        <div class="btn-content"><span>🚫</span><span>Микрофон недоступен</span></div>
      </template>
      <template v-else>
        <div class="btn-content" v-if="isMicEnabled"><span>🎤</span><span>Микрофон включён</span></div>
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

function monitorVolume(track: MediaStreamTrack, identity: string) {
  const audioCtx = new AudioContext();
  const stream = new MediaStream([track]);
  const source = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 512;
  source.connect(analyser);

  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  function update() {
    analyser.getByteTimeDomainData(dataArray);

    let sumSquares = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const val = (dataArray[i] - 128) / 128;
      sumSquares += val * val;
    }
    const rms = Math.sqrt(sumSquares / dataArray.length);

    const amplified = Math.min(1, rms * amplifyFactor);

    volumes[identity] = amplified;

    requestAnimationFrame(update);
  }

  update();
}

async function connectToRoom() {
  if (!props.liveKitToken || !props.liveKitRoomName) return;

  room = new Room();

  room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, pub, participant: RemoteParticipant) => {
    if (track.kind === "audio") {
      const audioEl = track.attach() as HTMLAudioElement;
      audioEl.autoplay = true;
      audioEl.controls = false;
      audioContainer.value?.appendChild(audioEl);

      remoteAudioElements.push(audioEl);

      addParticipant(participant);
      monitorVolume(track.mediaStreamTrack, participant.identity);
    }
  });

  room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack, pub, participant: RemoteParticipant) => {
    track.detach().forEach((el) => {
      const idx = remoteAudioElements.indexOf(el as HTMLAudioElement);
      if (idx !== -1) remoteAudioElements.splice(idx, 1);
      el.remove();
    });
    removeParticipant(participant.identity);
  });

  room.on(RoomEvent.ParticipantDisconnected, (participant) => {
    removeParticipant(participant.identity);
  });

  await room.connect(import.meta.env.VITE_LIVEKIT_URL, props.liveKitToken);

  addParticipant(room.localParticipant);

  // 🔁 эмит 20 раз/сек
  emitTimer = window.setInterval(() => {
    let changed = false;
    const out: Record<string, number> = {};

    for (const [id, val] of Object.entries(volumes)) {
      const prev = prevVolumes[id] ?? -1;
      out[id] = val;
      if (Math.abs(val - prev) > minDiff) {
        changed = true;
      }
    }

    if (changed) {
      emit("volumesUpdate", out);
      Object.assign(prevVolumes, out);
    }
  }, 50);
}

function addParticipant(p: Participant) {
  if (!volumes[p.identity]) {
    volumes[p.identity] = 0;
    prevVolumes[p.identity] = 0;
  }
}

function removeParticipant(identity: string) {
  delete volumes[identity];
  delete prevVolumes[identity];
}

async function enableMicrophone() {
  if(!isMicrophoneSupports()){
    notificationsProvider?.addPopup('microphone-is-not-available', 'simple-popup', {
      title: 'Включение микрофона недоступно',
      message: 'Данная функция временно отключена на IPhone.<br/><br/>Подробнее в <a target="_blank" href="https://vk.com/wall-232362939_2">официальной группе Лапа Play</a>'
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

      monitorVolume(track, room.localParticipant.identity);
    }
    if (localAudioTrack.isMuted) {
      await localAudioTrack.unmute();
    }
    isMicEnabled.value = true;
  } catch (e) {
    Console.error(">>> VoiceChat.vue >>> Ошибка включения микрофона:", e);
  }
}

async function disableMicrophone() {
  if (!room || !localAudioTrack) return;
  if (!localAudioTrack.isMuted) {
    await localAudioTrack.mute();
  }
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
    await enableMicrophone();
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
  return !(platform?.value == 'mobile_iphone' &&
      clientInfo.value.platform == 'ios' &&
      clientInfo.value.app == 'vkclient' //&&
      //!VersionComparator.isGreater(clientInfo.value.version, '8.147.0') //todo: указать версию, с которой не крашится приложение ВК на айфонах
  );
}

onMounted(() => {
  connectToRoom();
});

onBeforeUnmount(() => {
  room?.disconnect();
  localAudioTrack?.stop();
  localAudioTrack = null;
  if (emitTimer) clearInterval(emitTimer);
  remoteAudioElements.splice(0, remoteAudioElements.length);
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
