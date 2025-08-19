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

      <div>
        <b>canUseTrialSubscription</b>
        <pre>
          {{ shop?.canUseTrialSubscription }}
        </pre>
      </div>
      <div>
        <b>coins</b>
        <pre>
          {{ shop?.coins }}
        </pre>
      </div>
      <div>
        <b>subscription</b>
        <pre>
          {{ shop?.subscriptions }}
        </pre>
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
  margin-bottom: 45px;

  color: #C99965;
  background-color: #FEE8C7;
  border: 3px solid #F7D7AD;
}

</style>