<template>
  <div class="settings">
    <div class="settings__title">
      Настройки
    </div>

    <div class="settings__content">
      <div class="item">
        <div class="item__title">
          <img src="/assets/img/games/bunker/icons/sound.png" alt="Звук"> Звук
        </div>
        <div class="item__value">
          <bunker-range-input @change="onChangeSound" v-model="soundValue" :min="0" :max="100" :step="1"/>
        </div>
      </div>
      <div class="item">
        <div class="item__title">
          <img src="/assets/img/games/bunker/icons/music.png" alt="Музыка"> Музыка
        </div>
        <div class="item__value">
          <bunker-range-input @change="onChangeMusic" v-model="musicValue" :min="0" :max="100" :step="1"/>
        </div>
      </div>
      <div class="item">
        <div class="item__title">
          <img src="/assets/img/games/bunker/icons/voice.png" alt="Игроки"> Игроки
        </div>
        <div class="item__value">
          <bunker-range-input @change="onChangeVoice" v-model="voiceValue" :min="0" :max="100" :step="1"/>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {onMounted, ref} from "vue";
import BunkerRangeInput from "@/components/games/bunker/components/BunkerRangeInput.vue";
import {storeToRefs} from "pinia";
import {themeStore} from "@/stores/Theme/themeStore.ts";

const {soundVolume, musicVolume, voiceVolume} = storeToRefs(themeStore());

const soundValue = ref<string>("100");
const musicValue = ref<string>("100");
const voiceValue = ref<string>("100");

const onChangeSound = () => {
  //todo: сохранить настройку
  soundVolume.value = soundValue.value;
}
const onChangeMusic = () => {
  //todo: сохранить настройку
  musicVolume.value = musicValue.value;
}
const onChangeVoice = () => {
  //todo: сохранить настройку
  voiceVolume.value = voiceValue.value;
}

onMounted(() => {
  soundValue.value = soundVolume.value;
  musicValue.value = musicVolume.value;
  voiceValue.value = voiceVolume.value;
});


</script>
<style lang="scss" scoped>
.settings {
  background-color: var(--bg-color-component);
  padding: 15px 15px 30px;
  border-radius: 12px;
  overflow: hidden;

  &__title {
    text-align: center;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 20px;
  }

  &__content{
    display: flex;
    flex-direction: column;
    gap: 15px;

    .item{

      display: flex;
      align-items: center;

      &__title{
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
        width: 88px;
        img{
          object-fit: contain;
          width: 20px;
        }
      }
      &__value{
        flex-grow: 1;
        position: relative;
        display: flex;
        flex-direction: column;

        input{
          width: 100%;
        }

      }
    }
  }
}
</style>