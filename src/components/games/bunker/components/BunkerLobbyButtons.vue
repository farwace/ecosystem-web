<template>
  <div class="buttons">
    <BunkerButton class="invite" @click="$emit('invite')">Пригласить друга</BunkerButton>
    <BunkerButton class="ready" v-if="!player?.isReady" @click="$emit('ready', true)">Готов</BunkerButton>
    <BunkerButton class="cancel" v-if="player?.isReady" @click="$emit('ready', false)">Отмена</BunkerButton>
  </div>
</template>
<script lang="ts" setup>
import BunkerButton from "@/components/games/bunker/components/BunkerButton.vue";
import type {TPlayer} from "@/components/games/bunker/types.ts";

const props = defineProps<{
  maxHeight?: number,
  player?: TPlayer
}>();

const emits = defineEmits(['ready', 'toggle-microphone', 'invite']);

</script>
<style lang="scss" scoped>
  .buttons{
    flex-grow: 1;
    display: flex;
    flex-direction: row;
    gap: 10px;
    align-items: center;
    justify-content: center;
    padding-bottom: 70px;

    .ready{
      background-color: #95501B;
    }
    .invite{
      background-color: #334240;
    }
    .cancel{
      background-color: #4e4e4e;
    }
  }
</style>