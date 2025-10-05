<template>
  <div class="room-settings">
    <div class="item">
      <div class="title">
        <label for="toggle-private-room">
          Тип комнаты:
        </label>
      </div>
      <div class="value inline">
        <UIToggle field-id="toggle-private-room" v-model="isPrivate"/> <label for="toggle-private-room">{{ isPrivate ? 'Закрытая' : 'Открытая' }}</label>
      </div>
    </div>
    <div class="item">
      <div class="title">
        <label for="toggle-use-bots">
          Подключение ботов:
        </label>
      </div>
      <div class="value inline">
        <UIToggle field-id="toggle-use-bots" v-model="useBots"/> <label for="toggle-use-bots">{{ useBots ? 'Выкл' : 'Вкл' }}</label>
      </div>
    </div>
    <div class="item">
      <div class="title">
        Количество игроков:
      </div>
      <div class="value">
        <bunker-players-count-toggle :players-count="playersCount || 8" @minus="onPlayersMinus" @plus="onPlayersPlus" />
      </div>
    </div>

    <div class="item">
        <div class="btn-create" @click="createRoom">
          Создать
        </div>
    </div>

  </div>
</template>
<script lang="ts" setup>

import UIToggle from "@/components/games/bunker/components/UIToggle.vue";
import {inject, onMounted, ref} from "vue";
import BunkerPlayersCountToggle from "@/components/games/bunker/components/BunkerPlayersCountToggle.vue";
import {NotificationsSymbol} from "@/modules/NotificationsModule/symbols.ts";
import type {INotificationsProvider} from "@/modules/NotificationsModule/Interfaces/INotificationsProvider.ts";
import {useAnimatedRouter} from "@/classes/utils/useAnimatedRouter.ts";

const notificationsProvider: INotificationsProvider | undefined = inject(NotificationsSymbol);
const router = useAnimatedRouter();

const isPrivate = ref<boolean>();
const useBots = ref<boolean>();
const playersCount = ref<number>();

const props = defineProps<{
  onGameStart?: () => void;
}>();

const emits = defineEmits(['close']);

const onPlayersMinus = () => {
  if((playersCount.value || 0) <= 4){
    notificationsProvider?.addNotification({
      type: "warning",
      message: 'Минимум 4 игрока',
      timeout: 1000
    })
    return;
  }
  playersCount.value = (playersCount.value || 8) - 1;

}
const onPlayersPlus = () => {
  if((playersCount.value || 0) >= 8){
    notificationsProvider?.addNotification({
      type: "warning",
      message: 'Максимум 8 игроков',
      timeout: 1000
    })
    return;
  }

  playersCount.value = (playersCount.value || 4) + 1;
}

const createRoom = () => {
  props?.onGameStart?.();
  emits('close');
  router.push({name: 'bunkerGame', query: {neo: 1, players: (playersCount.value || 8), private: isPrivate.value ? 1 : 0, bots: !useBots.value ? 1 : 0}});
}

onMounted(() => {
  isPrivate.value = false;
  playersCount.value = 8;
});

</script>
<style lang="scss" scoped>

[theme=dark]{
  .room-settings {
    :deep(.players-toggle){
      input{
        background-color: #F5D8B6;
        color: #321D02;
      }
      .change{
        background-color: #6f3218;
        color: #F5D8B6;
      }
    }
    :deep(.toggle-private){
      .toggle{
        background-color: #6f3218;
      }
    }
  }
}

.room-settings {
  display: flex;
  flex-direction: column;
  gap: 15px;

  .item{
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 15px;
    align-items: center;
  }

  .value{
    &.inline{
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      align-items: center;
      gap: 8px;
    }
  }

  :deep(.toggle-private){
    .toggle{
      background-color: #BC7D4D;
    }
  }

  :deep(.players-toggle){
    .change{
      background-color: #BC7D4D;
      color: #F5D8B6;
    }
    input{
      background-color: #F5D8B6;
      color: #BC7D4D;
    }
  }

}

.btn-create{
  margin-left: auto;
  margin-right: auto;
  margin-top: 5px;
  border-radius: 12px;
  padding: 5px 10px 4px;
  background-color: #FF7E85;
  color: #FFEDCB;
  cursor: pointer;
  box-shadow: 0 4px 0 #F06470;
  transition: background-color .2s ease-out, box-shadow .2s ease-out;
  &:hover{
    background-color: #eb6d73;
    box-shadow: 0 4px 0 #d8515d;
  }
  &:active{
    background-color: #e66066;
    box-shadow: 0 2px 0 #d8515d;
  }
  &.disabled{
    background-color: #ffa6a8;
    box-shadow: 0 4px 0 #e6999b;
    cursor: not-allowed;
  }
}
</style>