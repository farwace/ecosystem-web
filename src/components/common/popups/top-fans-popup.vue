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
import {useAnimatedRouter} from "@/classes/utils/useAnimatedRouter.ts";

const router = useAnimatedRouter();

const props = defineProps<{
  id?: number,
}>();

const emit = defineEmits(['close']);
const userProvider: IUserProvider | undefined = inject(UserProviderSymbol);

const isLoading = ref<boolean>(false);
const fans = ref<TUser[]>();


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
  loadFans();
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

[theme=dark]{
  .title{
    color: #939393;
    background-color: #222222;
    border-color: #363738;
  }
}
</style>