<template>
  <div class="item">
    <div class="item__index">
      {{ +index+1 }}
    </div>
    <div class="item__avatar">
      <UserAvatar avatar-small small :first-name="user.firstName" :avatar="user.avatar" />
    </div>
    <div class="item__popularity" v-if="user.popularitySum">
      <small class="small">Вклад:</small> {{ prepareNumber(user.popularitySum) }}
    </div>
  </div>
</template>
<script lang="ts" setup>
import type {TUser} from "@/stores/Ecosystem/Types/TUser.ts";
import UserAvatar from "@/components/pages/Home/UserAvatar.vue";
import {prepareNumber} from "@/classes/utils/PrepareNumber.ts";

const props = defineProps<{
  user: TUser,
  index: number,
}>();
</script>
<style lang="scss" scoped>
.item{
  display: flex;
  flex-wrap: nowrap;
  gap: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--box-border);
  margin-bottom: 10px;
  align-items: center;

  &__index{
    flex-shrink: 0;
  }
  &__popularity{
    flex-shrink: 0;
    margin-left: auto;
  }
  &__avatar{
    flex-shrink: 0;
    img{
      width: 30px;
      height: 30px;
      border-radius: 100%;
    }
  }
}
</style>