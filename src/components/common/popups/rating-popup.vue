<template>
  <div
      class="rating"
      :class="{loading: isLoading}"
  >
    <div class="rating-header">
      <div class="title">
        Рейтинг популярности
      </div>
    </div>
    <div class="rating__items">
      <div @click="openProfile(user.id)" :style="getItemStyleVars(index)" v-for="(user, index) in popularityRatingPersons" :key="`user-${user.id}-${index}`">
        <TopUserItem :stub="stub" :position="+index+1" :user="user"/>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>

import {computed, inject, onMounted, ref} from "vue";
import {UserProviderSymbol} from "@/modules/ApiModule/symbols.ts";
import type {IUserProvider} from "@/modules/ApiModule/Interfaces/IUserProvider.ts";
import type {TUser} from "@/stores/Ecosystem/Types/TUser.ts";
import TopUserItem from "@/components/common/popups/Popularity/TopUserItem.vue";
import {useAnimatedRouter} from "@/classes/utils/useAnimatedRouter.ts";
import {useThemeStore} from "@/stores/theme.ts";
import {storeToRefs} from "pinia";

const userProvider: IUserProvider | undefined = inject(UserProviderSymbol);
const isLoading = ref<boolean>(false);

const {isDark} = storeToRefs(useThemeStore());
const router = useAnimatedRouter();
const stub = ref<boolean>(true);
const popularityRatingPersons = ref<TUser[]>(
    [
      {
        "firstName": "Тигрёнок",
        "id": 1,
        "popularity": 1000,
        "popularityLevel": 0,
        "nextLevelPopularity": 1000,
        "sex": 2,
        "avatar": "/assets/img/animals/tiger.svg",
        "avatarBig": "/assets/img/animals/tiger.svg",
        "online": false,
        "experience": 15,
        "vip": false,
        "lvl": 1,
        "premium": false
      },
      {
        "firstName": "Котик",
        "id": 2,
        "popularity": 1000,
        "popularityLevel": 0,
        "nextLevelPopularity": 1000,
        "sex": 1,
        "avatar": "/assets/img/animals/cat.svg",
        "avatarBig": "/assets/img/animals/cat.svg",
        "online": false,
        "experience": 15,
        "vip": false,
        "lvl": 1,
        "premium": false
      },
      {
        "firstName": "Панда",
        "id": 1,
        "popularity": 1000,
        "popularityLevel": 0,
        "nextLevelPopularity": 1000,
        "sex": 2,
        "avatar": "/assets/img/animals/panda.svg",
        "avatarBig": "/assets/img/animals/panda.svg",
        "online": false,
        "experience": 15,
        "vip": false,
        "lvl": 1,
        "premium": false
      },
      {
        "firstName": "Лисёнок",
        "id": 2,
        "popularity": 1000,
        "popularityLevel": 0,
        "nextLevelPopularity": 1000,
        "sex": 1,
        "avatar": "/assets/img/animals/fox.svg",
        "avatarBig": "/assets/img/animals/fox.svg",
        "online": false,
        "experience": 15,
        "vip": false,
        "lvl": 1,
        "premium": false
      },
      {
        "firstName": "Коала",
        "id": 1,
        "popularity": 1000,
        "popularityLevel": 0,
        "nextLevelPopularity": 1000,
        "sex": 2,
        "avatar": "/assets/img/animals/koala.svg",
        "avatarBig": "/assets/img/animals/koala.svg",
        "online": false,
        "experience": 15,
        "vip": false,
        "lvl": 1,
        "premium": false
      },
      {
        "firstName": "Цыплёнок",
        "id": 2,
        "popularity": 1000,
        "popularityLevel": 0,
        "nextLevelPopularity": 1000,
        "sex": 1,
        "avatar": "/assets/img/animals/chicken.svg",
        "avatarBig": "/assets/img/animals/chicken.svg",
        "online": false,
        "experience": 15,
        "vip": false,
        "lvl": 1,
        "premium": false
      },
      {
        "firstName": "Лисёнок",
        "id": 1,
        "popularity": 1000,
        "popularityLevel": 0,
        "nextLevelPopularity": 1000,
        "sex": 2,
        "avatar": "/assets/img/animals/fox.svg",
        "avatarBig": "/assets/img/animals/fox.svg",
        "online": false,
        "experience": 15,
        "vip": false,
        "lvl": 1,
        "premium": false
      },
    ]
);
const emit = defineEmits(['close']);

const openProfile  = (id: number) => {
  emit('close', () => {
    router.push({name: 'profile', params: {id}});
  });
}

const loadPopularityRating = async () => {
  isLoading.value = true;
  try{
    const res = (await userProvider?.getPopularityRating())?.data;
    if(res){
      popularityRatingPersons.value = res;
      stub.value = false;
    }

  }
  catch (e:any){}
  finally {
    isLoading.value = false;
  }
}

const arStyles = computed(() => {
  if(isDark.value){
    return [
      ['#292928', '#32302e'],
      ['#323232', '#414142'],
    ]
  }
  return [
    ['#FFF9EF', '#EDC0A3'],
    ['#ECF7F8', '#C9D1D4'],
    ['#FFE9DC', '#EBBFA0'],
    ['#FBF7D2', '#F5D19E'],
  ]
});

const getItemStyleVars = (index: number) => {
  const style = arStyles.value[index % arStyles.value.length];
  return {
    '--card-bg': style[0],
    '--card-border': style[1],
  }
}

onMounted(() => {
  loadPopularityRating();
});


</script>
<style scoped lang="scss">
[theme="dark"]{
  .title{
    color: #939393;
    background-color: #222222;
    border-color: #363738;
  }
}


.rating{
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



.rating-header{
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

.rating{
  &__items{
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
}

</style>