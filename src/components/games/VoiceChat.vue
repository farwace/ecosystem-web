<template>
  <div class="voice-chat">
    <button v-if="canIToggleMicrophone" @click="toggleMicrophone">
      <span v-if="isMicEnabled">🎤 Микрофон включён</span>
      <span v-else>🔇 Микрофон выключен</span>
    </button>

    <div ref="audioContainer" style="display:none;"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import {
  Room,
  RoomEvent,
  RemoteTrack,
  RemoteTrackPublication,
  RemoteParticipant,
  LocalAudioTrack,
} from "livekit-client";

const props = defineProps<{
  liveKitToken: string;
  liveKitRoomName: string;
  canISpeak: boolean;
  canIToggleMicrophone: boolean;
}>();

const isMicEnabled = ref(false);
let room: Room | null = null;
let localAudioTrack: LocalAudioTrack | null = null; // один трек на всё время
const audioContainer = ref<HTMLDivElement | null>(null);

async function connectToRoom() {
  if (!props.liveKitToken || !props.liveKitRoomName) return;

  room = new Room();

  room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
    if (track.kind === "audio") {
      const audioEl = track.attach();
      audioEl.autoplay = true;
      audioEl.controls = false;
      audioContainer.value?.appendChild(audioEl);
    }
  });

  room.on(RoomEvent.TrackUnsubscribed, (track) => {
    track.detach().forEach((el) => el.remove());
  });

  await room.connect(import.meta.env.VITE_LIVEKIT_URL, props.liveKitToken);

  // 🚫 Не включаем микрофон сразу, только по кнопке
}

async function enableMicrophone() {
  if (!room) return;

  try {
    if (!localAudioTrack) {
      // получаем трек только один раз
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      //const track = stream.getTracks()[0];
      //localAudioTrack = new LocalAudioTrack(track);
      //await room.localParticipant.publishTrack(localAudioTrack);
    }
    // if(localAudioTrack.isMuted){
    //   await localAudioTrack.unmute();
    // }
    isMicEnabled.value = true;
  } catch (e) {
    console.error("Ошибка включения микрофона:", e);
  }
}

async function disableMicrophone() {
  if (!room || !localAudioTrack) return;
  if(!localAudioTrack.isMuted){
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
}
</style>