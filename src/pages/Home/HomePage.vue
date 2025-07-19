<template>
  <div class="home">
    <div class="header">
      <user-avatar/>
      <user-experience />
    </div>

    <div class="game-list">
      <game-list />
    </div>

  </div>
</template>
<script lang="ts" setup>

import UserAvatar from "@/components/pages/Home/UserAvatar.vue";
import UserExperience from "@/components/pages/Home/UserExperience.vue";
import GameList from "@/components/pages/Home/GameList.vue";
</script>
<style lang="scss" scoped>
.home{
  padding: 20px;
}

.header{
  display: flex;
  flex-wrap: nowrap;
  gap: 15px;

  @media(min-width: 390px){
    gap: 28px;
  }
}

.game-list{
  margin-top: 20px;
}
</style>