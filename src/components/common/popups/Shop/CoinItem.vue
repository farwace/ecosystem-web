<template>
  <div>
    <CoinText :text="coin.name" />
  </div>
</template>
<script lang="ts" setup>
import {storeToRefs} from "pinia";
import {achievementsStore} from "@/stores/Achievements/achievementsStore.ts";
import type {TShopCoin} from "@/modules/ApiModule/Types/TShopCoin.ts";
import CoinText from "@/components/common/popups/Shop/CoinText.vue";

const {canUseTrialSubscription} = storeToRefs(achievementsStore());

const props = defineProps<{
  coin: TShopCoin,
}>();

</script>
<style lang="scss" scoped>

</style>