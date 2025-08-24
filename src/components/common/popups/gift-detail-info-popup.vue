<template>
  <div class="gift-data">
    <img :src="`/assets/img/gifts/${gift.code}.png`" :alt="gift.code">
    <div class="gift-data__name">
      {{ gift.name }}
    </div>
    <div class="gift-data__top-sender" v-if="gift.sender" @click="onSenderClick">
      <img class="gift-data__top-sender__avatar" :src="gift.sender?.avatar" :alt="gift.sender?.firstName">
      <span class="gift-data__top-sender__name">{{ gift.sender?.firstName }}</span>
      <span class="gift-data__top-sender__count">x{{gift.topSenderQuantity}}</span>
    </div>

    <div class="gift-data__info">
      <div class="gift-data__info__item">
        <span>Цена</span>
        <span><UiIcon class="inline-icon" name="coin"/>&nbsp;{{ prepareNumber(gift.oldPrice || gift.price) }}</span>
      </div>
      <div class="gift-data__info__item">
        <span>Кол-во</span>
        <span>{{ gift.totalQuantity }}</span>
      </div>

    </div>
  </div>
</template>
<script lang="ts" setup>
import type {TGift} from "@/stores/Ecosystem/Types/TGift.ts";
import UiIcon from "@/components/common/icons/UiIcon.vue";
import {prepareNumber} from "@/classes/utils/PrepareNumber.ts";
import {storeToRefs} from "pinia";
import {ecosystemStore} from "@/stores/Ecosystem/ecosystemStore.ts";
import {useAnimatedRouter} from "@/classes/utils/useAnimatedRouter.ts";

const props = defineProps<{
  gift: TGift,
  onProfileClick?: () => void,
}>();

const {id} = storeToRefs(ecosystemStore());
const emits = defineEmits(['close']);
const router = useAnimatedRouter();

const onSenderClick = () => {
  if(!props.gift.sender?.id || props.gift.sender.id == id.value){
    return;
  }
  router.push({name: 'profile', params: {id: props.gift.sender?.id}});
  props.onProfileClick?.();
  emits('close');
}

</script>
<style lang="scss" scoped>
.gift-data {
  &__name {
    text-align: center;
    font-weight: bold;
    margin-bottom: 10px;
  }

  &__top-sender{
    margin-top: 5px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 4px;
    &__avatar{
      flex-shrink: 0;
    }
    &__count{
      flex-shrink: 0;
    }
    &__name{
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: .8em;
    }
    img{
      border-radius: 100%;
      width: 32px;
      height: 32px;
    }
  }
  &__info {
    margin-top: 15px;
    &__item {
      display: flex;
      justify-content: space-between;
      font-size: .9em;
      margin-bottom: .5em;
    }
  }
}
</style>