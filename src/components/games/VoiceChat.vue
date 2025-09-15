<template>
  <div class="voice-chat">
    <button v-if="canIToggleMicrophone" @click="toggleMicrophone">
      <span v-if="isMicEnabled">🎤 Микрофон включён</span>
      <span v-else>🔇 Микрофон выключен</span>
    </button>

    <!-- контейнер для аудиопотоков других игроков -->
    <div ref="audioContainer" style="display:none;"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import {
  Room,
  RemoteParticipant,
  RemoteTrackPublication,
  RoomEvent,
  createLocalAudioTrack,
} from "livekit-client";

const props = defineProps<{
  liveKitToken: string;
  liveKitRoomName: string;
  canISpeak: boolean;
  canIToggleMicrophone: boolean;
}>();

const isMicEnabled = ref(false);
let room: Room | null = null;

const audioContainer = ref<HTMLDivElement | null>(null);

async function connectToRoom() {
  if (!props.liveKitToken || !props.liveKitRoomName) return;

  room = new Room();

  room.on(RoomEvent.TrackSubscribed, (track, pub, participant) => {
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

  // if (props.canISpeak) {
  //   await enableMicrophone();
  // }
}

async function enableMicrophone() {
  if (!room) return;
  try {
    const audioTrack = await createLocalAudioTrack();
    //await room.localParticipant.publishTrack(audioTrack);
    isMicEnabled.value = true;
  } catch (e) {
    console.error("Ошибка включения микрофона:", e);
  }
}

async function disableMicrophone() {
  if (!room) return;
  room.localParticipant.audioTrackPublications.forEach((pub) => {
    pub.track?.stop();
    room?.localParticipant.unpublishTrack(pub.track!);
  });
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