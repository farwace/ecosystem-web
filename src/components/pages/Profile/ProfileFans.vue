<template>
  <div class="profile__fans">
    <template v-if="(fans?.length || 0) > 0">

    </template>
    <template v-else>
      Очарование никто не охраняет
    </template>
  </div>
</template>
<script lang="ts" setup>

import type {TUser} from "@/stores/Ecosystem/Types/TUser.ts";

const props = defineProps<{
  fans?:TUser[] | null
}>();


</script>
<style lang="scss" scoped>
.profile{
  &__fans{

  }
}
</style>