<template>
  <div class="profile__gifts">
    <template v-if="(gifts?.length || 0) > 0">

    </template>
    <template v-else>
      Здесь ничего нет 😭 <span class="send-gift" v-if="id" @click="giftsProvider?.openGiftsPopup(id, avatar)">подарите подарок!</span>
    </template>
  </div>
</template>
<script lang="ts" setup>

import type {TGift} from "@/stores/Ecosystem/Types/TGift.ts";
import type {IGiftsProvider} from "@/modules/ApiModule/Interfaces/IGiftsProvider.ts";
import {inject} from "vue";
import {GiftsProviderSymbol} from "@/modules/ApiModule/symbols.ts";
const giftsProvider: IGiftsProvider | undefined = inject(GiftsProviderSymbol);

const props = defineProps<{
  gifts?:TGift[],
  id?: number | string,
  avatar?: string
}>();


</script>
<style lang="scss" scoped>
.profile{
  &__gifts{

  }
}
.send-gift{
  cursor: pointer;
  text-decoration: underline;
}
</style>