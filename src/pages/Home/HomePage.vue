<template>
  <div class="page-container">
    <div class="header">
      <user-avatar :alarm="hasUnclaimedCompletedAchievement" :first-name="firstName" :avatar="avatar" @click="() => id && router.push({name: 'profile', params: {id: id}})"/>
      <user-experience />
    </div>

    <div class="game-list">
      <game-list />
    </div>

    <div class="btn-list">
      <menu-list />
    </div>

    <div class="settings-block">
      <MenuItem @click="openSettings" icon="settings">Настройки</MenuItem>
    </div>
    <div class="add-to-block" v-if="!inFavorites && !inHomeScreen">
      <div @click="addToFavorite" class="add-to-favorite" v-if="!inFavorites">
        <ui-icon class="favorite-icon" name="star"/>
        <span>Добавить в<br/>избранное</span>
      </div>
    </div>

  </div>
</template>
<script lang="ts" setup>

import UserAvatar from "@/components/pages/Home/UserAvatar.vue";
import UserExperience from "@/components/pages/Home/UserExperience.vue";
import GameList from "@/components/pages/Home/GameList.vue";
import MenuList from "@/components/pages/Home/MenuList.vue";
import MenuItem from "@/components/pages/Home/MenuItem.vue";
import UiIcon from "@/components/common/icons/UiIcon.vue";
import {storeToRefs} from "pinia";
import {bridgeStore} from "@/stores/Bridge/bridgeStore.ts";
import {useRoute, useRouter} from "vue-router";
import {ecosystemStore} from "@/stores/Ecosystem/ecosystemStore.ts";
import {achievementsStore} from "@/stores/Achievements/achievementsStore.ts";

const {id, firstName, avatar} = storeToRefs(ecosystemStore());
const {inFavorites, inHomeScreen} = storeToRefs(bridgeStore());
const {hasUnclaimedCompletedAchievement} = storeToRefs(achievementsStore());
const router = useRouter();

const openSettings = () => {
  alert('Настройки')
}

const addToFavorite = () => {
  alert('Добавить в избранное')
}


</script>
<style lang="scss" scoped>
.page-container{
  padding: 20px;
  overflow-y: auto;
  max-height: 100%;
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

.btn-list{
  display: flex;
  flex-wrap: nowrap;
  gap: 15px;
  justify-content: space-between;
  margin-top: 25px;
}

.settings-block{
  position: fixed;
  bottom: 30px;
  left: 15px;
}

.add-to-block{
  position: fixed;
  bottom: 35px;
  right: 15px;
}
.add-to-favorite{
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 7px;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  border-radius: 100px;
  padding: 6px 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
.favorite-icon{
  width: 45px;
  height: 45px;
}

</style>