<template>
  <div class="game">
    <suspense>
      <Bunker :neoRoom="neoRoom"/>
      <template #fallback>
        <LoadingPage />
      </template>
    </suspense>
  </div>
</template>
<script lang="ts" setup>
import {useRoute} from "vue-router";
import Bunker from "@/components/games/bunker/bunker.vue";
import LoadingPage from "@/components/pages/LoadingPage.vue";
const route = useRoute();
const neoRoom = !!route.query?.neo;


</script>
<style lang="scss" scoped>
.game {
  display: flex;
  height: 100%;
}
</style>