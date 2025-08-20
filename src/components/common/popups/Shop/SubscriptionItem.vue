<template>
  <div>
    {{ subscription.name }}
  </div>
</template>
<script lang="ts" setup>
import type {TShopSubscription} from "@/modules/ApiModule/Types/TShopSubscription.ts";
import {storeToRefs} from "pinia";
import {achievementsStore} from "@/stores/Achievements/achievementsStore.ts";

const {canUseTrialSubscription} = storeToRefs(achievementsStore());

const props = defineProps<{
  subscription: TShopSubscription,
}>();

</script>
<style lang="scss" scoped>

</style>