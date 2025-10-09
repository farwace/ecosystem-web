<template>
  <div
      class="friends"
      :class="{loading: isLoading}"
  >
    <div class="friends-header">
      <div class="title">
        Друзья
      </div>
    </div>
    <div class="friends__items">
      <div @click="openProfile(user.id)" :style="getItemStyleVars(index)" v-for="(user, index) in arFriends" :key="`user-${user.id}-${index}`">
        <TopUserItem :stub="isLoading" :position="+index+1" :user="user"/>
      </div>
      <div ref="onLoadingRef" v-show="arFriends.length > 0 && !isLoading && !!hasMore">
        &nbsp;&nbsp;&nbsp;
      </div>
    </div>
    <div v-if="!isLoading && arFriends.length < 1">
      Здесь пока никого нет
    </div>
  </div>
</template>
<script lang="ts" setup>

import {computed, inject, onBeforeUnmount, onMounted, ref, watch} from "vue";
import type {IUserProvider} from "@/modules/ApiModule/Interfaces/IUserProvider.ts";
import {UserProviderSymbol} from "@/modules/ApiModule/symbols.ts";
import type {TUser} from "@/stores/Ecosystem/Types/TUser.ts";
import TopUserItem from "@/components/common/popups/Popularity/TopUserItem.vue";
import {useAnimatedRouter} from "@/classes/utils/useAnimatedRouter.ts";
import {storeToRefs} from "pinia";
import {themeStore} from "@/stores/Theme/themeStore.ts";
import {bridgeStore} from "@/stores/Bridge/bridgeStore.ts";
import type {IGameProvider} from "@/modules/GameModule/Interfaces/IGameProvider.ts";
import {GameProviderSymbol} from "@/modules/GameModule/symbols.ts";
import {filter, type Subscription} from "rxjs";
import type {TReverbMessage} from "@/modules/ReverbModule/Types/TReverbMessage.ts";
const isLoading = ref<boolean>(false);
const emit = defineEmits(['close']);

const {isDark} = storeToRefs(themeStore());
const {accessToken, scope} = storeToRefs(bridgeStore());

const router = useAnimatedRouter();
const userProvider: IUserProvider | undefined = inject(UserProviderSymbol);
const arFriends = ref<TUser[]>([]);
const page = ref<number>(1);
const hasMore = ref<boolean>(true);
const isMoreLoading = ref<boolean>(false);
const onLoadingRef = ref<HTMLDivElement | null>(null);
let loadingObserver: IntersectionObserver | null = null;
const gameProvider: IGameProvider | undefined = inject(GameProviderSymbol);
let updateFriendsSubscriber: Subscription | undefined;

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


const openProfile  = (id: number) => {
  emit('close', () => {
    router.push({name: 'profile', params: {id}});
  });
}


const doAction = async () => {
  isLoading.value = true;
  if(!accessToken.value || scope.value.indexOf('friends') < 0){
    await userProvider?.queryAuthToken?.('friends');
  }

  const friends = await userProvider?.queryFriends?.(page.value);
  if(friends?.data && (friends?.data?.length || 0) > 0){
    arFriends.value = friends.data;
  }

  if(!updateFriendsSubscriber && (friends?.data?.length || 0) < 1){
    let emitter = gameProvider?.getGameEmitter$?.();
    updateFriendsSubscriber = emitter?.pipe?.(
        filter((message): message is TReverbMessage<any> => message.event === 'user_update_friends'),
    )?.subscribe?.((message) => {
      doAction();
    });
  }

  isLoading.value = false;
}

const loadMore = async () => {
  if(!hasMore.value || isMoreLoading.value){
    return;
  }
  isMoreLoading.value = true;
  try{
    const nextPage = page.value + 1;
    const friends = await userProvider?.queryFriends?.(nextPage);
    if(friends?.data && (friends?.data?.length || 0) > 0){
      page.value = nextPage;
      friends.data.forEach((friend) => {
        arFriends.value.push(friend);
      });
    }
    else{
      hasMore.value = false;
      loadingObserver?.disconnect();
      loadingObserver = null;
    }
  }
  finally {
    isMoreLoading.value = false;
  }
}

const setupLoadingObserver = () => {
  if(typeof window === 'undefined' || !('IntersectionObserver' in window)){
    return;
  }

  if(!onLoadingRef.value){
    return;
  }

  loadingObserver?.disconnect();

  const rootElement = onLoadingRef.value.closest('.popup__content');
  const root = rootElement instanceof Element ? rootElement : null;

  loadingObserver = new IntersectionObserver((entries) => {
    if(!hasMore.value || isMoreLoading.value){
      return;
    }

    const isIntersecting = entries.some((entry) => entry.isIntersecting);
    if(isIntersecting){
      void loadMore();
    }
  }, {
    root,
    rootMargin: '0px 0px 200px 0px',
  });

  loadingObserver.observe(onLoadingRef.value);
}

onMounted(() => {
  doAction();
});

watch(() => onLoadingRef.value, (el) => {
  if(el){
    setupLoadingObserver();
  }
}, {immediate: true});

onBeforeUnmount(() => {
  loadingObserver?.disconnect();
  loadingObserver = null;
  updateFriendsSubscriber?.unsubscribe?.();
});

</script>
<style scoped lang="scss">
[theme="dark"]{
  .title{
    color: #939393;
    background-color: #222222;
    border-color: #363738;
  }

  .friends{
    &.loading{
      &:before{
        background-color: rgba(255, 255, 255, 0.1);
      }
    }
  }
}


.friends{
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



.friends-header{
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

.friends{
  &__items{
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
}

</style>
