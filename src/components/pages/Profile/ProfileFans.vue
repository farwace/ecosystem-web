<template>
  <div class="profile__fans" v-if="fans">
    Хранители
  </div>
</template>
<script lang="ts" setup>

import type {TUser} from "@/stores/Ecosystem/Types/TUser.ts";

const props = defineProps<{
  fans?:TUser[]
}>();


</script>
<style lang="scss" scoped>
.profile{
  &__fans{

  }
}
</style>