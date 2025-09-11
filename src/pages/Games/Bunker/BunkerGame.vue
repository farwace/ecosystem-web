<template>
  <div class="game">
    <suspense>
      <Bunker :neoRoom="neoRoom" :players-count="playersCount" :is-private-room="isPrivateRoom"/>
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
const playersCount = route.query?.players as string;
const isPrivateRoom = route.query?.private as string;


</script>
<style lang="scss" scoped>
.game {
  display: flex;
  height: 100%;
}
</style>

<style lang="scss">
.game-bunker {
  .btn-pp-close-background {fill: #884614}
  .btn-pp-close-border {fill: #502B04}
  .btn-pp-close-cross {fill:#FFEFCC}
  .btn-pp-close-cross-border {fill: #502B04}
}
</style>