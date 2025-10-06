<template>
  <div
      class="friends"
      :class="{loading: isLoading}"
  >
    <div class="friends-header">
      <div class="title">
        Друзья
      </div>
    </div>
    <div class="friends__items">
      {{ arUsers.length }}
    </div>
  </div>
</template>
<script lang="ts" setup>

import {inject, onMounted, ref} from "vue";
import type {IUserProvider} from "@/modules/ApiModule/Interfaces/IUserProvider.ts";
import {UserProviderSymbol} from "@/modules/ApiModule/symbols.ts";
import type {TUser} from "@/stores/Ecosystem/Types/TUser.ts";
const isLoading = ref<boolean>(false);
const emit = defineEmits(['close']);

const userProvider: IUserProvider | undefined = inject(UserProviderSymbol);
const arUsers = ref<TUser[]>([]);

const doAction = async () => {
  await userProvider?.queryAuthToken?.('friends');
  const friends = await userProvider?.queryFriends?.();
  console.log('>>> FRIDNDS', friends);

}

onMounted(() => {
  doAction();
});

</script>
<style scoped lang="scss">
[theme="dark"]{
  .title{
    color: #939393;
    background-color: #222222;
    border-color: #363738;
  }

  .friends{
    &.loading{
      &:before{
        background-color: rgba(255, 255, 255, 0.1);
      }
    }
  }
}


.friends{
  position: relative;
  padding: 0 15px 40px;
  &.loading{
    pointer-events: none;
    &:before{
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.4);
      z-index: 20000;
    }
  }
}



.friends-header{
  position: sticky;
  z-index: 10001;
  top: 0;
  padding-top: 20px;
  padding-bottom: 15px;
  margin-bottom: 10px;
  background-color: var(--bg-color-component);
  padding-right: 5px;
}
.title{
  font-size: 24px;
  line-height: 22px;
  font-weight: bold;
  text-align: center;
  padding: 10px 12px;
  border-radius: 100px;

  color: #C99965;
  background-color: #FEE8C7;
  border: 3px solid #F7D7AD;
}

.friends{
  &__items{
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
}

</style>