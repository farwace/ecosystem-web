<template>
  <div class="item">
    <div class="item__description">
      <div class="text" v-if="coin.description?.length > 0">
        <div class="absolute-marquee-text" v-marquee="'scroll'">
          <CoinText :text="coin.description" />
        </div>
      </div>
    </div>
    <div class="item__title">
      <CoinText :text="coin.name" />
    </div>
    <div class="item__picture" v-if="coin.imageUrl">
      <img :src="coin.imageUrl" :alt="''">
    </div>

    <div class="item__old-price" v-if="(coin.oldPrice || 0) > 0">
      &nbsp;{{ prepareNumber(coin.oldPrice || 0) }}&nbsp;{{ PluralForm((coin.oldPrice || 0), 'голос', 'голоса', 'голосов') }}&nbsp;
    </div>
    <div class="item__price" @click="openDonateBox(coin)">
      {{ prepareNumber(coin.price) }} {{ PluralForm((coin.price || 0), 'голос', 'голоса', 'голосов') }}
    </div>
  </div>
</template>
<script lang="ts" setup>
import type {TShopCoin} from "@/modules/ApiModule/Types/TShopCoin.ts";
import CoinText from "@/components/common/popups/Shop/CoinText.vue";
import {PluralForm} from "@/classes/utils/PluralForm.ts";
import {prepareNumber} from "@/classes/utils/PrepareNumber.ts";
import {vMarquee} from "@/classes/directives/marquee.ts";
import type {IPlatformEvents} from "@/modules/EventsModule/Interfaces/IPlatformEvents.ts";
import {inject} from "vue";
import {PlatformEventsSymbol} from "@/modules/EventsModule/symbols.ts";

const platformEventsProvider: IPlatformEvents | undefined = inject(PlatformEventsSymbol);
const props = defineProps<{
  coin: TShopCoin,
}>();

const openDonateBox = (coin: TShopCoin) => {
  platformEventsProvider?.buyMoney(coin);
}

</script>
<style lang="scss" scoped>
.item{
  border-radius: 6px;
  box-shadow: 0 0 8px rgba(0,0,0, .1);
  padding: 5px;
  background: #FF963A;
  background: linear-gradient(135deg, rgb(255, 150, 58) 0%, rgb(255, 106, 74) 100%);
  color: #FFF;
  position: relative;
  cursor: pointer;
  transition: box-shadow .3s ease-out, transform .3s ease-out;
  will-change: transform;
  &:hover{
    box-shadow: 0 0 8px rgba(0,0,0,.3);
    transform: scale3d(1.02, 1.02, 1.02);
  }

  &__description{
    white-space: nowrap;
    position: absolute;
    top: 6px;
    left: 0;
    width: 100%;
    overflow: hidden;
    font-size: 10px;
    height: 14px;
    .text{
      background-color: #FFF9EE;
      height: 14px;
      padding: 0 10px;
    }
    color: #FC4C07;
  }

  &__title{
    margin-top: 18px;
    font-size: 16px;
    font-weight: bold;
    text-align: center;
  }

  &__picture{
    display: flex;
    img{
      width: 60px;
      height: 60px;
      object-fit: contain;
      margin: auto;
    }
  }

  &__old-price{
    position: absolute;
    white-space: nowrap;
    font-size: 11px;
    width: 100%;
    text-align: center;
    left: 0;
    text-decoration: line-through;
  }
  &__price{
    white-space: nowrap;
    font-size: 11px;
    color: #FC5A07;
    background-color: #FFF9EE;
    border-radius: 100px;
    padding: 4px 6px;
    font-weight: 500;
    text-align: center;
    margin-top: 16px;
    margin-bottom: 10px;
  }

  .absolute-marquee-text{
    text-align: center;
    display: inline-block;
    position: absolute;
    left: 0;
    width: 100%;
    height: 100%;
    &.scroll{
      -webkit-animation: scroll 12s infinite linear;
      -moz-animation: scroll 12s infinite linear;
      animation: scroll 12s infinite linear;
    }
  }
}

@-webkit-keyframes scroll {
  0% {transform: translateX(0%);}
  40% {transform: translateX(var(--marquee-width));}
  52% {transform: translateX(var(--marquee-width));}
  90% {transform: translateX(0%);}
  100% {transform: translateX(0%);}
}

@-moz-keyframes scroll {
  0% {transform: translateX(0%);}
  40% {transform: translateX(var(--marquee-width));}
  52% {transform: translateX(var(--marquee-width));}
  90% {transform: translateX(0%);}
  100% {transform: translateX(0%);}
}

@keyframes scroll {
  0% {transform: translateX(0%);}
  40% {transform: translateX(var(--marquee-width));}
  52% {transform: translateX(var(--marquee-width));}
  90% {transform: translateX(0%);}
  100% {transform: translateX(0%);}
}
</style>