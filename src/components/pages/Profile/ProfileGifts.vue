<template>
  <div class="profile__gifts" v-if="gifts">
    Топ подарков
  </div>
</template>
<script lang="ts" setup>

import type {TGift} from "@/stores/Ecosystem/Types/TGift.ts";

const props = defineProps<{
  gifts?:TGift[]
}>();


</script>
<style lang="scss" scoped>
.profile{
  &__gifts{

  }
}
</style>