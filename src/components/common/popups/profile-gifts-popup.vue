<template>
  <div
      class="top-gifts"
      :class="{
        loading: isLoading
      }"
  >
    <div class="gifts-header">
      <div class="gifts-header__info">
        <UserAvatar :first-name="props.name || ''" :avatar="props.avatar" small/>
        <div class="data">
          <div class="data__body">
            <div class="data__title">Общее количество подарков:</div>
            <div class="data__value">{{ isLoading ? '&nbsp;' : (appliedGifts.length || 0) }}</div>
          </div>
        </div>
      </div>
      <div class="title">
        Коллекция подарков
      </div>
    </div>
    <div class="top-gifts__inner">
      <div class="gifts-items" v-if="!isLoading">
        <div class="gifts-items__container" >
          <div class="gifts-items__inner">
            <template v-for="(gift, index) in appliedGifts" :key="`user-${props.id}-gift-${gift.id}-popup-${index}`">
              <gift-wall-item :gift="gift" @click="openGiftDetailPopup(gift)"/>
            </template>
          </div>

          <div class="gifts-items__delimiter" v-if="(sortedGifts?.length || 0) > 0">
            Не получены:
          </div>
          <div class="gifts-items__inner">
            <template v-for="(gift, index) in notAppliedGifts" :key="`user-${props.id}-gift-${gift.id}-popup-${index}`">
              <gift-wall-item :gift="gift"/>
            </template>
          </div>

        </div>
      </div>
      <div v-else class="gifts-items">
        <div class="gifts-items__container" >
          <div class="gifts-items__inner">
            <template v-for="i in 20" :key="`user-${props.id}-stub-gift-popup-${i}`">
              <gift-wall-item stub/>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {computed, inject, onMounted, ref} from "vue";
import {UserProviderSymbol} from "@/modules/ApiModule/symbols.ts";
import type {IUserProvider} from "@/modules/ApiModule/Interfaces/IUserProvider.ts";
import type {TGift} from "@/stores/Ecosystem/Types/TGift.ts";
import GiftWallItem from "@/components/common/popups/Gift/gift-wall-item.vue";
import type {INotificationsProvider} from "@/modules/NotificationsModule/Interfaces/INotificationsProvider.ts";
import {NotificationsSymbol} from "@/modules/NotificationsModule/symbols.ts";
import UserAvatar from "@/components/pages/Home/UserAvatar.vue";

const props = defineProps<{
  id?: number,
  avatar?: string,
  name?: string,
}>();

const emit = defineEmits(['close']);
const userProvider: IUserProvider | undefined = inject(UserProviderSymbol);
const notificationsProvider: INotificationsProvider | undefined = inject(NotificationsSymbol);

const isLoading = ref<boolean>(false);
const gifts = ref<TGift[]>();

const loadGifts = async () => {
  isLoading.value = true;
  try {
    const giftsRes = (await userProvider?.getTopGifts(props.id!))?.data;
    if(giftsRes){
      gifts.value = giftsRes;
    }
  }
  catch (e:any){}
  finally {
    isLoading.value = false;
  }

}

const sortedGifts = computed(() => {
  return gifts.value?.sort((a,b) => {
    return (a.sort || 0) > (b.sort || 0) ? 1 : -1;
  })?.sort((a,b) => {
    if(a.price > b.price){
      return -1;
    }
    if(a.price < b.price){
      return 1;
    }
    return 0;
  }) || [];
});

const appliedGifts = computed(() => {
  return sortedGifts.value.filter((g) => {
    return !!g.sender
  });
});

const notAppliedGifts = computed(() => {
  return sortedGifts.value.filter((g) => {
    return !g.sender
  });
});

const openGiftDetailPopup = (gift: TGift) => {
  notificationsProvider?.addPopup(`user-${props.id}-gift-${gift.id}-detail`, 'gift-detail-info-popup', {
    modal: true,
    darkBg: true,
    noTitle: true,
    small: true,
    gift: gift,
    onProfileClick: () => {
      emit('close');
    }
  })
}

onMounted(() => {
  if(!props.id) {
    emit('close');
    return;
  }
  loadGifts();
});

</script>
<style lang="scss" scoped>
.top-gifts{
  position: relative;
  padding: 0 8px 40px;
  border-radius: 12px;
  &__inner{
    background-color: #FFF;
    border: 3px solid #7DBAFF;
    border-radius: 35px;
  }
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
.gifts-header{
  position: sticky;
  z-index: 10001;
  top: 0;
  padding-top: 20px;
  padding-bottom: 0;
  margin-bottom: -55px;
  background-color: #FFB3D2;
  border-radius: 0 0 35px 35px;

  &__info{
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 5px;
    .avatar{
      flex-shrink: 0;
    }
    :deep(.avatar__name__value){
      color: #124887;
    }

    .data{
      flex-grow: 1;
      &__body{
        text-align: center;
        height: 100%;
        border-radius: 12px;
        border: 8px solid #FF8DE3;
        background-color: #FECDF2;
        box-shadow: 0 4px 4px rgba(235, 25, 172, 0.4);
        width: fit-content;
        margin: -10px auto 0;
        padding: 5px;
        color: #124887;
        font-weight: 600;

      }
      &__title{
        font-size: 12px;
        text-transform: uppercase;
      }
      &__value{
        font-size: 20px;
        font-weight: bold;
      }
    }
  }
}
.title{
  font-size: 22px;
  line-height: 22px;
  font-weight: bold;
  text-align: center;
  padding: 20px 5px;
  border-radius: 35px;
  text-transform: uppercase;
  white-space: nowrap;
  color: #5192DB;
  background-color: #CDE8FF;
  border: 3px solid #7DBAFF;
  margin: 0;
}

.gifts-items{
  padding: 60px 10px 40px;
  position: relative;
  &__container{
    position: relative;
  }
  &__delimiter{
    margin-top: 20px;
    margin-bottom: 10px;
  }
  &__inner{
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    justify-content: space-between;
  }
}

//.v-popper__popper.v-popper__popper--shown{
//  z-index: 10002;
//}
</style>