<template>
  <div class="voice-chat">
    <button v-if="canIToggleMicrophone" @click="toggleMicrophone">
      <span v-if="isMicEnabled">🎤 Микрофон включён</span>
      <span v-else>🔇 Микрофон выключен</span>
    </button>

    <ul class="participants">
      <li v-for="p in participants" :key="p.sid">
        <span>{{ p.name }}</span>
        <div class="volume-bar">
          <div
              class="volume-level"
              :style="{ width: (p.volume * 100) + '%' }"
          ></div>
        </div>
      </li>
    </ul>

    <div ref="audioContainer" style="display:none;"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import {
  Room,
  RoomEvent,
  RemoteTrack,
  RemoteParticipant,
  LocalAudioTrack,
  Participant,
} from "livekit-client";

const props = defineProps<{
  liveKitToken: string;
  liveKitRoomName: string;
  canISpeak: boolean;
  canIToggleMicrophone: boolean;
}>();

const isMicEnabled = ref(false);
let room: Room | null = null;
let localAudioTrack: LocalAudioTrack | null = null;
const audioContainer = ref<HTMLDivElement | null>(null);

type ParticipantUI = {
  sid: string;
  name: string;
  volume: number; // [0..1]
};

const participants = ref<ParticipantUI[]>([]);

// 🔊 карта sid → функция обновления громкости
const volumeMap = new Map<string, (level: number) => void>();

// коэффициент усиления громкости (по умолчанию ×10)
const amplifyFactor = 10;

function monitorVolume(track: MediaStreamTrack, sid: string) {
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

    // усиливаем сигнал
    const amplified = Math.min(1, rms * amplifyFactor);

    const updateFn = volumeMap.get(sid);
    if (updateFn) updateFn(amplified);

    requestAnimationFrame(update);
  }

  update();
}

async function connectToRoom() {
  if (!props.liveKitToken || !props.liveKitRoomName) return;

  room = new Room();

  room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, pub, participant: RemoteParticipant) => {
    if (track.kind === "audio") {
      const audioEl = track.attach();
      audioEl.autoplay = true;
      audioEl.controls = false;
      audioContainer.value?.appendChild(audioEl);

      addParticipant(participant);

      monitorVolume(track.mediaStreamTrack, participant.sid);
    }
  });

  room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack, pub, participant: RemoteParticipant) => {
    track.detach().forEach((el) => el.remove());
    removeParticipant(participant.sid);
  });

  room.on(RoomEvent.ParticipantDisconnected, (participant) => {
    removeParticipant(participant.sid);
  });

  await room.connect(import.meta.env.VITE_LIVEKIT_URL, props.liveKitToken);

  addParticipant(room.localParticipant);
}

function addParticipant(p: Participant) {
  if (participants.value.find((x) => x.sid === p.sid)) return;
  participants.value.push({ sid: p.sid, name: p.identity, volume: 0 });

  volumeMap.set(p.sid, (level: number) => {
    const idx = participants.value.findIndex((x) => x.sid === p.sid);
    if (idx !== -1) {
      participants.value[idx].volume = level;
    }
  });
}

function removeParticipant(sid: string) {
  participants.value = participants.value.filter((p) => p.sid !== sid);
  volumeMap.delete(sid);
}

async function enableMicrophone() {
  if (!room) return;

  try {
    if (!localAudioTrack) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const track = stream.getTracks()[0];
      localAudioTrack = new LocalAudioTrack(track);
      await room.localParticipant.publishTrack(localAudioTrack);

      monitorVolume(track, room.localParticipant.sid);
    }
    if (localAudioTrack.isMuted) {
      await localAudioTrack.unmute();
    }
    isMicEnabled.value = true;
  } catch (e) {
    console.error("Ошибка включения микрофона:", e);
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
  if (isMicEnabled.value) {
    await disableMicrophone();
  } else {
    await enableMicrophone();
  }
}

onMounted(() => {
  connectToRoom();
});

onBeforeUnmount(() => {
  room?.disconnect();
  localAudioTrack?.stop();
  localAudioTrack = null;
  volumeMap.clear();
});
</script>

<style scoped>
.voice-chat button {
  background: #444;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 10px;
}

.participants {
  list-style: none;
  padding: 0;
  margin: 0;
}

.participants li {
  display: flex;
  align-items: center;
  margin: 4px 0;
}

.volume-bar {
  flex: 1;
  height: 6px;
  background: #333;
  margin-left: 8px;
  border-radius: 3px;
  overflow: hidden;
}

.volume-level {
  height: 100%;
  background: limegreen;
  transition: width 0.15s linear;
}
</style>
