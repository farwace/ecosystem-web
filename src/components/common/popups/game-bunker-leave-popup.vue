<template>
  <div class="leave">
    <div class="leave__title">
      Покинуть игру?
    </div>
    <div class="leave__buttons">
      <BunkerButton class="btn-close" @click="$emit('close')">
        Остаться
      </BunkerButton>
      <BunkerButton class="btn-leave" @click="onLeave">
        Выйти
      </BunkerButton>
    </div>
  </div>
</template>
<script lang="ts" setup>

import BunkerButton from "@/components/games/bunker/components/BunkerButton.vue";

const emit = defineEmits(['close']);

const props = defineProps<{
  leaveCallback?:() => void,
}>();

const onLeave = () => {
  props?.leaveCallback?.();
  emit('close');
}

</script>

<style lang="scss" scoped>
.leave{
  background-color: var(--bg-color-component);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(3px);
  border-radius: 20px;
  text-align: center;
  padding: 20px;

  &__title{
    font-size: 18px;
    margin-bottom: 20px;

  }

  &__buttons{
    display: flex;
    justify-content: space-around;
    gap: 10px;

    .btn-close{
      background-color: #334240;
    }
    .btn-leave{
      background-color: #95501B;
    }
  }
}



</style>