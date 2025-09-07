<template>
  <div class="settings" v-click-outside="() => isOpen = false">
    <div class="settings__button" @click="isOpen = !isOpen">
      <UiIcon name="burger"/>
    </div>
    <div class="settings__menu" :class="{open: isOpen}">
      <div class="item-players" v-if="host">
        Игроки
        <div class="players-toggle">
          <div class="change minus" @click="emit('minus')">
            <UiIcon name="icon-minus"/>
          </div>
          <div>
            <input id="current-players" type="text" readonly :value="playersCount || 8">
          </div>
          <div class="change plus" @click="emit('plus')">
            <UiIcon name="icon-plus"/>
          </div>
        </div>
      </div>
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

const emit = defineEmits(['settings', 'rules', 'leave', 'minus', 'plus']);

const props = defineProps<{
  playersCount?: number,
  host?: boolean,
}>();

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

[theme=dark]{
  .settings{
    &__menu{
      .item-players{
        .players-toggle{
          input{
            color: #939393;
          }
        }
      }
    }
  }
}

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
      cursor: pointer;
      transition: background-color .2s ease-out;
      &:hover{
        background-color: #4e4141;
      }
    }

    .item-players{
      padding: 4px 8px;
      display: flex;
      flex-wrap: nowrap;
      gap: 10px;

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