<template>
  <div class="settings" v-click-outside="() => isOpen = false">
    <div class="settings__button" @click="isOpen = !isOpen">
      <UiIcon name="burger"/>
    </div>
    <div class="settings__menu" :class="{open: isOpen}">
      <div class="item" @click="onSettingsClick">Настройки</div>
      <div class="item" @click="onRulesClick">Правила игры</div>
      <div class="item" @click="onLeaveClick">Выйти</div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import UiIcon from "@/components/common/icons/UiIcon.vue";
import {ref} from "vue";
import {ClickOutside} from "@/classes/directives/clickOutside.ts";
const isOpen = ref<boolean>(false);
const vClickOutside = ClickOutside;

const emit = defineEmits(['settings', 'rules', 'leave']);

const onSettingsClick = () => {
  emit('settings');
  isOpen.value = false;
}
const onRulesClick = () => {
  emit('rules');
  isOpen.value = false;
}
const onLeaveClick = () => {
  emit('leave');
  isOpen.value = false;
}

</script>
<style lang="scss" scoped>
.settings{
  position: relative;
  z-index: 10;

  &__menu{
    display: none;
    background-color: #2E1E0E;
    padding: 2px;
    margin-top: 8px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);


    .item{
      padding: 4px 8px;
      &:hover{
        background-color: #4e4141;
      }
    }
    &.open{
      display: block;
    }
  }

  &__button{
    color: #E5CC9F;
    border-radius: 100%;
    background-color: #2E1E0E;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    svg{
      width: 24px;
      height: 24px;
    }
  }
}
</style>