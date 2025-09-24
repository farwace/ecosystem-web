<template>
  <div class="bunker-outer">
    <bunker-game-room :room="room" v-if="room" />
  </div>
</template>
<script lang="ts" setup>


import type {RoomAvailable} from "colyseus.js";
import {Client, Room} from "colyseus.js";

import {storeToRefs} from "pinia";
import {ecosystemStore} from "@/stores/Ecosystem/ecosystemStore.ts";
import {inject, onBeforeUnmount, onMounted, ref, shallowRef, watch} from "vue";
import BunkerGameRoom from "@/components/games/bunker/BunkerGameRoom.vue";
import {NotificationsSymbol} from "@/modules/NotificationsModule/symbols.ts";
import type {INotificationsProvider} from "@/modules/NotificationsModule/Interfaces/INotificationsProvider.ts";
import {useAnimatedRouter} from "@/classes/utils/useAnimatedRouter.ts";
import {Console} from "@/classes/utils/Console.ts";

const {authString} = storeToRefs(ecosystemStore());
const router = useAnimatedRouter();
const notificationsProvider: INotificationsProvider | undefined = inject(NotificationsSymbol);

const props = defineProps<{
  neoRoom?: boolean,
  roomId?: string,
  playersCount?: string,
  isPrivateRoom?: string,
}>();

const client: {instance?: Client | null} = {
  instance: new Client(import.meta.env.VITE_GAME_ENDPOINT)
};

const room = shallowRef<Room>();
const error = ref<string>();

const handleRoomLeave = (code: any) => {
  if(code != 1000){
    notificationsProvider?.addPopup('game-bunker-disconnect', 'simple-popup', {
      title: 'Соединение разорвано',
      message: 'Вы были отключены от игровой комнаты по причине потери соединения с сервером',
      modal: true,
      darkBg: true,
      middle: true,
    })
    router.push('/');
  }
};

const attachRoomHandlers = (roomInstance?: Room) => {
  if(!roomInstance){
    return;
  }

  roomInstance.onLeave.once((code) => {
    handleRoomLeave(code);
  });
  roomInstance.onError((code, message) => {
    Console.log('>>> BUNKER ROOM ERROR', code, message);
  });
};

const loadRooms = (lobby: Room):Promise<RoomAvailable[]> => {
  return new Promise(async (resolve) => {
    lobby.onMessage("rooms", (rooms: RoomAvailable[]) => {
      resolve(rooms);
    });
  })
}

const stubPromise = (ms: number, result: any = undefined): Promise<any> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(result);
    }, ms);
  })
}

async function findOrCreateBunkerRoom(forceCreate = false): Promise<Room> {
  const lobby = await client.instance!.joinOrCreate("lobby");
  const allRooms = await Promise.race([loadRooms(lobby), stubPromise(5000, [])]) as RoomAvailable[];
  lobby?.removeAllListeners?.();
  lobby?.leave?.();

  const joinOptions = {authString: (authString.value || '').replace('Bearer ', '')};

  if(forceCreate){
    return await client.instance!.create("bunker_game", Object.assign({}, joinOptions, {isPrivate: !(props.isPrivateRoom == '0'), playersCount: (props.playersCount || 8)}));
  }

  const availableRooms = allRooms?.filter?.(r => r.metadata?.canJoin === true && r.name === "bunker_game");
  if((availableRooms?.length || 0) > 0){

    for (const r of availableRooms) {
      try {
        const joined = await client.instance!.joinById(r.roomId, joinOptions);
        return joined;
      }
      catch (e: any){}
    }
  }

  // 4) подходящих нет или все расхватали — создаём новую
  return await client.instance!.create("bunker_game", joinOptions);
}

if(props.roomId){
  try {
    const lobby = await client.instance!.joinOrCreate("lobby");
    const allRooms = await Promise.race([loadRooms(lobby), stubPromise(5000, [])]) as RoomAvailable[];
    lobby?.removeAllListeners?.();
    lobby?.leave?.();

    const joinOptions = {authString: (authString.value || '').replace('Bearer ', '')};
    const targetRoom = allRooms?.find?.((availableRoom) => availableRoom.name == "bunker_game" && availableRoom.metadata?.customId == props.roomId);

    if(targetRoom){
      room.value = await client.instance!.joinById(targetRoom.roomId, joinOptions);
      attachRoomHandlers(room.value);
    }
    else{
      const createOptions = Object.assign({}, joinOptions, {
        customId: props.roomId,
      });

      room.value = await client.instance!.create("bunker_game", createOptions);
      attachRoomHandlers(room.value);
    }
  }
  catch (e: any){
    Console.log('>>> JOIN BY CUSTOM ID ERROR', e);
    error.value = 'Не удалось найти игровую комнату или все места заняты';
  }
}
else{
  try {
    room.value = await findOrCreateBunkerRoom(props.neoRoom);
    attachRoomHandlers(room.value);
  }
  catch (e: any){
    error.value = 'Не удалось присоединиться к игровой комнате';
  }
}

onMounted(() => {
  if(!room.value?.roomId && error.value){
    notificationsProvider?.addNotification({
      type: 'error',
      message: error.value
    });

    router.push('/');
  }
})

onBeforeUnmount(() => {
  client.instance = null;
  delete client.instance;
});

watch(error, (neoVal) => {
  if(neoVal){
    notificationsProvider?.addNotification({
      type: 'error',
      message: neoVal
    });

    router.push('/');
  }
});

</script>
<style lang="scss" scoped>
.bunker-outer{
  display: flex;
  height: 100%;
  flex-grow: 1;
}
</style>