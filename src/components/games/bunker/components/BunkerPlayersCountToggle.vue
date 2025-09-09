<template>
  <div class="players-toggle">
    <div class="change minus" @click="$emit('minus')">
      <UiIcon name="icon-minus"/>
    </div>
    <div>
      <input id="current-players" type="text" readonly :value="playersCount || 8">
    </div>
    <div class="change plus" @click="$emit('plus')">
      <UiIcon name="icon-plus"/>
    </div>
  </div>
</template>
<script lang="ts" setup>

import UiIcon from "@/components/common/icons/UiIcon.vue";

defineProps<{
  playersCount: number;
}>();

defineEmits(['minus', 'plus']);

</script>
<style lang="scss" scoped>

[theme=dark]{
  .players-toggle{
    input{
      color: #939393;
    }
  }
}

.players-toggle{
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  .change{
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #653816;
    padding: 5px;
    svg{
      width: 10px;
      height: 10px;
    }
  }
  .plus{
    border-radius: 0 4px 4px 0;
  }
  .minus{
    border-radius: 4px 0 0 4px;
  }
  input{
    width: 28px;
    height: 20px;
    background-color: #321D02;
    border: none;
    outline: none;
    color: #BC7D4D;
    text-align: center;
  }
}

</style>