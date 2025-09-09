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
import {inject, onBeforeUnmount, ref, shallowRef, watch} from "vue";
import BunkerGameRoom from "@/components/games/bunker/BunkerGameRoom.vue";
import {NotificationsSymbol} from "@/modules/NotificationsModule/symbols.ts";
import type {INotificationsProvider} from "@/modules/NotificationsModule/Interfaces/INotificationsProvider.ts";
import {useAnimatedRouter} from "@/classes/utils/useAnimatedRouter.ts";

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
    //todo: присоединение к комнате напрямую await client.joinById(r.roomId, joinOptions);
  }
  catch (e: any){

  }
}
else{
  try {
    room.value = await findOrCreateBunkerRoom(props.neoRoom);
  }
  catch (e: any){
    error.value = 'Не удалось присоединиться к игровой комнате';
  }
}

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