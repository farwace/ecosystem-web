<template>
<div class="game-chat">
  Сообщение:
  <textarea @keydown="onEnterKeyDown" ref="inputRef" id="chat-input-textarea" class="game-chat__textarea" rows="2" maxlength="50" v-model="msg"></textarea>
  <div>
    <BunkerButton class="send-btn" @click="sendMsg">Отправить</BunkerButton>
  </div>

  <div class="last-messages">
    <div class="message" v-for="message in lastMessages">
      {{ message }}
    </div>
  </div>
</div>
</template>
<script lang="ts" setup>
import BunkerButton from "@/components/games/bunker/components/BunkerButton.vue";
import {onMounted, ref} from "vue";
import {storeToRefs} from "pinia";
import {gameStore} from "@/stores/Game/gameStore.ts";

const {lastMessages} = storeToRefs(gameStore());
const inputRef = ref<HTMLTextAreaElement>();

const props = defineProps<{
  sendCallback?: (msg: string) => void;
}>();

const emits = defineEmits(["close"]);

const msg = ref<string>();

onMounted(() => {
  if(inputRef.value) {
    inputRef.value.focus();
  }
});

const sendMsg = () => {
  props?.sendCallback?.(msg.value || '');
  emits('close');
}

const onEnterKeyDown = (e: KeyboardEvent) => {
  if(e?.key === 'Enter' || e?.keyCode === 13) {
    sendMsg();
  }
}

</script>
<style lang="scss" scoped>

.game-chat {
  padding: 10px;

  &__textarea {
    width: 100%;
    resize: none;

    padding: 8px 12px;
    border: 1px solid #ab9076;
    border-radius: 8px;
    background: #fff8f1;
    font-size: 14px;
    color: #5c4a3c;

  }

  textarea{
    width: 100%;
  }

  .send-btn {
    background-color: #95501B;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
  }

  .last-messages{
    position: absolute;
    top: 100%;
    width: calc(100% - 20px);

    .message{
      margin-bottom: 2px;
      border-radius: 4px;
      padding: 2px 4px;
      background-color: rgba(0, 0, 0, 0.5);
    }
  }
}

[theme=dark]{
  .game-chat {
    padding: 10px;

    &__textarea {
      background-color: #323232;
      color: #939393;
    }
  }
}

</style>