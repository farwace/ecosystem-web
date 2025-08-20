<template>
  <div
      class="shop"
      :class="{loading: isLoading}"
  >
    <div class="shop-header">
      <div class="title">
        Магазин
      </div>

    </div>
    <div ref="shopContainer">
      <div class="shop__subscription" v-if="(shop?.subscriptions?.length || 0) > 0">
        <div class="shop__title">
          Купить подписку
        </div>
        <div class="shop__subscription__list">
          <SubscriptionItem v-for="subscription in shop?.subscriptions" :key="`subscription-${subscription.code}`" :subscription="subscription"/>
        </div>
      </div>
      <div class="shop__coins" v-if="(shop?.coins?.length || 0) > 0">
        <div class="shop__title">
          Купить монеты
        </div>
        <div class="shop__coins__list">
          <CoinItem v-for="coin in shop?.coins" :key="`coin-${coin.code}`" :coin="coin"/>
        </div>
      </div>

    </div>
  </div>
</template>
<script lang="ts" setup>

import {inject, onMounted, ref} from "vue";
import {BalanceProviderSymbol, UserProviderSymbol} from "@/modules/ApiModule/symbols.ts";
import type {IUserProvider} from "@/modules/ApiModule/Interfaces/IUserProvider.ts";
import {Dropdown as VDropdown, vTooltip} from "floating-vue";
import 'floating-vue/dist/style.css'
import type {IBalanceProvider} from "@/modules/ApiModule/Interfaces/IBalanceProvider.ts";
import type {TShopResponse} from "@/modules/ApiModule/Types/TShopResponse.ts";
import SubscriptionItem from "@/components/common/popups/Shop/SubscriptionItem.vue";
import CoinItem from "@/components/common/popups/Shop/CoinItem.vue";


const userProvider: IUserProvider | undefined = inject(UserProviderSymbol);
const balanceProvider: IBalanceProvider | undefined = inject(BalanceProviderSymbol);

const isLoading = ref<boolean>(false);

defineOptions({
  components: {
    VDropdown,
  },
  directives: {
    vTooltip
  }
})

const shopContainer = ref<HTMLDivElement>();
const shop = ref<TShopResponse>();

const loadItems = async () => {
  isLoading.value = true;
  try{
    shop.value = await balanceProvider?.getShopItems();
  }
  catch (e){}
  finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadItems();
});


</script>
<style scoped lang="scss">
[theme="dark"]{
  .title{
    color: #C99965;
  }
}


.shop{
  position: relative;
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



.shop-header{
  position: sticky;
  z-index: 10001;
  top: 0;
  padding-top: 20px;
  padding-bottom: 10px;
  margin-bottom: 5px;
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

.shop{
  &__title{
    color: #b9845a;
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 10px;
  }

  &__subscription{
    margin-bottom: 20px;

    &__list{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
  }
  &__coins{
    margin-bottom: 20px;
    &__list{
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
    }
  }
}

</style>