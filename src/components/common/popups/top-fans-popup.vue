<template>
  <div
      class="top-fans"
      :class="{
        loading: isLoading
      }"
  >
    <div>
      <div class="fans-header">
        <div class="title">
          Поклонники
        </div>
      </div>
      <div class="fans-items">
        <template v-for="(fan, index) in sortedFans" :key="`user-${props.id}-fan-${fan.id}-${index}`">
          <TopFanSimple @click="onUserFanClick(fan.id)" :user="fan" :index="index"/>
        </template>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {computed, inject, onMounted, ref} from "vue";
import {UserProviderSymbol} from "@/modules/ApiModule/symbols.ts";
import type {IUserProvider} from "@/modules/ApiModule/Interfaces/IUserProvider.ts";
import type {TUser} from "@/stores/Ecosystem/Types/TUser.ts";
import TopFanSimple from "@/components/common/popups/TopFans/TopFanSimple.vue";
import {useRouter} from "vue-router";

const router = useRouter();

const props = defineProps<{
  id?: number,
}>();

const emit = defineEmits(['close']);
const userProvider: IUserProvider | undefined = inject(UserProviderSymbol);

const isLoading = ref<boolean>(false);
const fans = ref<TUser[]>(
    [
      {
        "popularitySum": 1000,
        "firstName": "Виталий",
        "id": 1,
        "popularity": 13440,
        "popularityLevel": 6,
        "nextLevelPopularity": 15000,
        "sex": 2,
        "avatar": "https://sun70-1.userapi.com/s/v1/ig2/Mnbl4RlowjH_RK3F4WtScE7ZDNV1bEffN0zmkmJMPRlcSU1aSqCExpd3DgQ8pKFC1Lat8JMNx74crBuhsdZiCV7A.jpg?quality=95&crop=67,1,760,760&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720&ava=1&u=xcC0HAjSZgUX3g2E42IUjU3tG-JqrJWCoUrkvX060A8&cs=100x100",
        "avatarBig": "https://sun70-1.userapi.com/s/v1/ig2/Mnbl4RlowjH_RK3F4WtScE7ZDNV1bEffN0zmkmJMPRlcSU1aSqCExpd3DgQ8pKFC1Lat8JMNx74crBuhsdZiCV7A.jpg?quality=95&crop=67,1,760,760&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720&ava=1&u=xcC0HAjSZgUX3g2E42IUjU3tG-JqrJWCoUrkvX060A8&cs=240x240",
        "online": true,
        "experience": 25,
        "vip": false,
        "premium": false,
        "lvl": 6
      },
        {
        "popularitySum": 2000,
        "firstName": "Виталий",
        "id": 1,
        "popularity": 13440,
        "popularityLevel": 6,
        "nextLevelPopularity": 15000,
        "sex": 2,
        "avatar": "https://sun70-1.userapi.com/s/v1/ig2/Mnbl4RlowjH_RK3F4WtScE7ZDNV1bEffN0zmkmJMPRlcSU1aSqCExpd3DgQ8pKFC1Lat8JMNx74crBuhsdZiCV7A.jpg?quality=95&crop=67,1,760,760&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720&ava=1&u=xcC0HAjSZgUX3g2E42IUjU3tG-JqrJWCoUrkvX060A8&cs=100x100",
        "avatarBig": "https://sun70-1.userapi.com/s/v1/ig2/Mnbl4RlowjH_RK3F4WtScE7ZDNV1bEffN0zmkmJMPRlcSU1aSqCExpd3DgQ8pKFC1Lat8JMNx74crBuhsdZiCV7A.jpg?quality=95&crop=67,1,760,760&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720&ava=1&u=xcC0HAjSZgUX3g2E42IUjU3tG-JqrJWCoUrkvX060A8&cs=240x240",
        "online": true,
        "experience": 25,
        "vip": false,
        "premium": false,
        "lvl": 6
      },
        {
        "popularitySum": 13440,
        "firstName": "Виталийdsaasd sad sadsadsasadsadsadsadsadsadsadsadsadsa",
        "id": 1,
        "popularity": 13440,
        "popularityLevel": 6,
        "nextLevelPopularity": 15000,
        "sex": 2,
        "avatar": "https://sun70-1.userapi.com/s/v1/ig2/Mnbl4RlowjH_RK3F4WtScE7ZDNV1bEffN0zmkmJMPRlcSU1aSqCExpd3DgQ8pKFC1Lat8JMNx74crBuhsdZiCV7A.jpg?quality=95&crop=67,1,760,760&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720&ava=1&u=xcC0HAjSZgUX3g2E42IUjU3tG-JqrJWCoUrkvX060A8&cs=100x100",
        "avatarBig": "https://sun70-1.userapi.com/s/v1/ig2/Mnbl4RlowjH_RK3F4WtScE7ZDNV1bEffN0zmkmJMPRlcSU1aSqCExpd3DgQ8pKFC1Lat8JMNx74crBuhsdZiCV7A.jpg?quality=95&crop=67,1,760,760&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720&ava=1&u=xcC0HAjSZgUX3g2E42IUjU3tG-JqrJWCoUrkvX060A8&cs=240x240",
        "online": true,
        "experience": 25,
        "vip": false,
        "premium": false,
        "lvl": 6
      },
        {
        "popularitySum": 13440,
        "firstName": "Виталий",
        "id": 1,
        "popularity": 13440,
        "popularityLevel": 6,
        "nextLevelPopularity": 15000,
        "sex": 2,
        "avatar": "https://sun70-1.userapi.com/s/v1/ig2/Mnbl4RlowjH_RK3F4WtScE7ZDNV1bEffN0zmkmJMPRlcSU1aSqCExpd3DgQ8pKFC1Lat8JMNx74crBuhsdZiCV7A.jpg?quality=95&crop=67,1,760,760&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720&ava=1&u=xcC0HAjSZgUX3g2E42IUjU3tG-JqrJWCoUrkvX060A8&cs=100x100",
        "avatarBig": "https://sun70-1.userapi.com/s/v1/ig2/Mnbl4RlowjH_RK3F4WtScE7ZDNV1bEffN0zmkmJMPRlcSU1aSqCExpd3DgQ8pKFC1Lat8JMNx74crBuhsdZiCV7A.jpg?quality=95&crop=67,1,760,760&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720&ava=1&u=xcC0HAjSZgUX3g2E42IUjU3tG-JqrJWCoUrkvX060A8&cs=240x240",
        "online": true,
        "experience": 25,
        "vip": false,
        "premium": false,
        "lvl": 6
      },
        {
        "popularitySum": 13440,
        "firstName": "Виталий",
        "id": 1,
        "popularity": 13440,
        "popularityLevel": 6,
        "nextLevelPopularity": 15000,
        "sex": 2,
        "avatar": "https://sun70-1.userapi.com/s/v1/ig2/Mnbl4RlowjH_RK3F4WtScE7ZDNV1bEffN0zmkmJMPRlcSU1aSqCExpd3DgQ8pKFC1Lat8JMNx74crBuhsdZiCV7A.jpg?quality=95&crop=67,1,760,760&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720&ava=1&u=xcC0HAjSZgUX3g2E42IUjU3tG-JqrJWCoUrkvX060A8&cs=100x100",
        "avatarBig": "https://sun70-1.userapi.com/s/v1/ig2/Mnbl4RlowjH_RK3F4WtScE7ZDNV1bEffN0zmkmJMPRlcSU1aSqCExpd3DgQ8pKFC1Lat8JMNx74crBuhsdZiCV7A.jpg?quality=95&crop=67,1,760,760&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720&ava=1&u=xcC0HAjSZgUX3g2E42IUjU3tG-JqrJWCoUrkvX060A8&cs=240x240",
        "online": true,
        "experience": 25,
        "vip": false,
        "premium": false,
        "lvl": 6
      },

    ]
);


const loadFans = async () => {
  isLoading.value = true;
  try {
    const fansRes = (await userProvider?.getTopFans(props.id!))?.data;
    if(fansRes){
      fans.value = fansRes;
    }
  }
  catch (e:any){}
  finally {
    isLoading.value = false;
  }

}

const sortedFans = computed(() => {
  return fans.value?.sort((a,b) => {
    return (a.popularitySum || 0) < (b.popularitySum || 0) ? 1 : -1;
  }) || [];
});

const onUserFanClick = (id: number) => {
  router.push({name: 'profile', params: {id: id}});
  emit('close');
}

onMounted(() => {
  if(!props.id) {
    emit('close');
    return;
  }
  //loadFans();
});

</script>
<style lang="scss" scoped>
.top-fans{
  position: relative;
  padding: 0 10px 16px;
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
.fans-header{
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

.fans-items{
  padding: 0 10px 40px;
}
</style>