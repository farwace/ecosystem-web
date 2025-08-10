<template>
  <div class="profile__fans">
    <template v-if="(fans?.length || 0) > 0">
      <div class="profile__fans__list">
        <div class="item" v-for="fan in fans">
          <img :src="fan?.avatar" :alt="fan?.firstName">
        </div>
      </div>
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
    &__list{
      display: flex;
      flex-wrap: nowrap;
      gap: 10px;
      img{
        border-radius: 100%;
        width: 45px;
        height: 45px;
        object-fit: cover;
      }
    }
  }
}
</style>