<template>
  <div class="big-gifts-outer">
    <transition-group name="big-gifts" appear>
      <div v-for="(gift, key) in gifts" :key="key" class="item">
        <img :src="`/assets/img/gifts/${gift.gift.code}.png`" :alt="gift.gift.code" class="item__img">
      </div>
    </transition-group>
  </div>
</template>
<script lang="ts" setup>
import {inject, onUnmounted, reactive} from "vue";
import {ReverbSymbol} from "@/modules/ReverbModule/symbols.ts";
import type {IReverbProvider} from "@/modules/ReverbModule/Interfaces/IReverbProvider.ts";
import {filter} from "rxjs";
import type {TReverbMessage} from "@/modules/ReverbModule/Types/TReverbMessage.ts";
import type {TSendGift} from "@/stores/Ecosystem/Types/TSendGift.ts";
import {storeToRefs} from "pinia";
import {ecosystemStore} from "@/stores/Ecosystem/ecosystemStore.ts";

const reverbProvider: IReverbProvider | undefined = inject(ReverbSymbol);
const {id} = storeToRefs(ecosystemStore());

const gifts = reactive<{ [key: string]: TSendGift }>({});

const showGift = (gift: TSendGift) => {
  const key = `${gift.senderId}-${gift.receiverId}-${gift.quantity}-${gift.gift.code}`;
  gifts[key] = gift;
  setTimeout(() => {
    delete gifts[key];
  }, 3000);
}

let subscription = reverbProvider?.getReverbObserver$()?.pipe(
    filter((message):message is TReverbMessage<TSendGift> => message.event === 'send_gift'),
)?.subscribe((message) => {
  if(message.data.senderId == id.value){
    showGift(message.data);
  }
});

onUnmounted(() => {
  subscription?.unsubscribe?.()
})
</script>
<style lang="scss">
.big-gifts-outer{
  .item{
    position: fixed;
    left: 50%;
    top: 20%;
    transform: translate(-50%);
  }
}
</style>