<template>
  <div class="access"
  >
    <div class="access-header">
      <div class="title">
        Добро пожаловать
      </div>
    </div>

    <div class="access__body text-center">
      <p class="">Лапа Play - это игры с друзьями!</p>
      <p class="mb-2">Играйте вместе с ними и получайте уведомления о новых сообщениях</p>
      <p class="mb-2">Нам необходимо получить следующие разрешения:</p>
      <div class="access-list">
        <ul>
          <li>Список друзей</li>
          <li>Уведомления от сообщества</li>
        </ul>
      </div>

      <div class="submit-btn">
        <UiBtn @click="onRequestAccess">Хорошо</UiBtn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import UiBtn from "@/components/common/ui/UiBtn.vue";
import {inject} from "vue";
import {UserProviderSymbol} from "@/modules/ApiModule/symbols.ts";
import type {IUserProvider} from "@/modules/ApiModule/Interfaces/IUserProvider.ts";

const userProvider: IUserProvider | undefined = inject(UserProviderSymbol);
const emit = defineEmits(['close']);

const onRequestAccess = () => {
  userProvider?.queryAuthToken?.('friends');
  emit('close');
}
</script>

<style scoped lang="scss">
.access{
  position: relative;
  padding: 0 15px 20px;
}
.access-header{
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

.submit-btn{
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.mb-2{
  margin-bottom: .5rem;
}

.access-list{
  text-align: left;
}

[theme="dark"]{
  .title{
    color: #939393;
    background-color: #222222;
    border-color: #363738;
  }

}
</style>