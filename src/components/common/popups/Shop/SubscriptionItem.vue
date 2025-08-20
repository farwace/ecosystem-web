<template>
  <div class="item">
    <UiIcon name="info" class="info-icon"/>
    <div class="item__title">
      <div class="picture" v-if="subscription.imageUrl">
        <img :src="subscription.imageUrl" :alt="subscription.name">
      </div>
      <div class="text">
        <div class="text__title">
          <span>
            {{ subscription.name }}
          </span>
        </div>
        <div class="text__description">
          <CoinText :text="subscription.description" />
        </div>
      </div>
    </div>
    <template v-if="canUseTrialSubscription && (subscription?.trialDuration || 0)> 0">
      <div class="item__price">
        <div class="buy-button">
          Бесплатно {{ subscription.trialDuration || 0 }} {{ PluralForm((subscription.trialDuration || 0), 'день', 'дня', 'дней')  }}
        </div>
        <div class="price">
          <div class="current">
            Затем: <b>{{ subscription.price }}&nbsp;{{ PluralForm(subscription.price, 'голос', 'голоса', 'голосов') }}</b>
          </div>
          <div class="old" v-if="(subscription?.oldPrice || 0) > 0">
            &nbsp;{{ subscription.oldPrice }}&nbsp;
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="item__price">
        <div class="buy-button">
          {{ subscription.price }}&nbsp;{{ PluralForm(subscription.price, 'голос', 'голоса', 'голосов') }}
        </div>
        <div class="price">
          <div class="old center" v-if="(subscription?.oldPrice || 0) > 0">
            &nbsp;{{ subscription.oldPrice }} {{ PluralForm(subscription.oldPrice, 'голос', 'голоса', 'голосов') }}&nbsp;
          </div>
        </div>
      </div>
    </template>

  </div>
</template>
<script lang="ts" setup>
import type {TShopSubscription} from "@/modules/ApiModule/Types/TShopSubscription.ts";
import {storeToRefs} from "pinia";
import {achievementsStore} from "@/stores/Achievements/achievementsStore.ts";
import 'floating-vue/dist/style.css'
import {Dropdown as VDropdown, vTooltip} from "floating-vue";
import UiIcon from "@/components/common/icons/UiIcon.vue";
import CoinText from "@/components/common/popups/Shop/CoinText.vue";
import {PluralForm} from "@/classes/utils/PluralForm.ts";


defineOptions({
  components: {
    VDropdown,
  },
  directives: {
    vTooltip
  }
})

const {canUseTrialSubscription} = storeToRefs(achievementsStore());

const props = defineProps<{
  subscription: TShopSubscription,
}>();

//todo: тултип с описанием что входит в подписку;

</script>
<style lang="scss" scoped>
.item{
  background-color: #FFF9EE;
  border: 2px solid #F7D7AD;
  border-radius: 10px;
  padding: 10px 5px 10px 0;
  position: relative;
  box-shadow: 0 0 8px rgba(0,0,0, .1);

  &__title{
    display: flex;
    flex-wrap: nowrap;
    gap: 3px;
    align-items: start;
    margin-bottom: 8px;

    .picture{
      flex-shrink: 0;
      width: 40px;
    }

    .text{
      flex-grow: 1;
      margin-top: 8px;

      &__title{
        font-size: 10px;
        font-weight: bold;
        line-height: 10px;
        margin-bottom: 10px;
        min-height: 20px;
        display: flex;

        span{
          margin: auto 0;
        }

        @media(min-width: 360px){
          font-size: 12px;
        }
      }

      &__description{
        font-size: 9px;
        line-height: 10px;
        font-weight: 500;

        @media (min-width: 360px) {
          font-size: 11px;
          line-height: 12px;
        }
      }
    }
  }

  .info-icon{
    color: #F7D7AD;
    width: 25px;
    height: 25px;
    position: absolute;
    top: -2px;
    right: -1px;
    cursor: pointer;
    transition: color .3s ease-out;
    &:hover{
      color: #efcb9a;
    }
  }

  &__price{
    padding-left: 5px;
    display: flex;
    flex-direction: column;

    .buy-button{
      border-radius: 100px;
      font-size: 12px;
      color: #FFF;
      background-color: #f9a172;
      text-align: center;
      width: fit-content;
      padding: 4px 10px;
      margin: 0 auto 8px;
      transition: background-color .3s ease-out;

      &:hover{
        background-color: #eb9567;
      }

      @media(min-width: 360px){
        font-size: 14px;
      }
    }

    .price{
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      font-size: 14px;
      line-height: 14px;
      gap: 10px;
      padding: 0 5px;

      .current{
        font-size: 12px;
        color: #8D603D;
        b{
          font-size: 14px;
        }
      }

      .old{
        font-size: 14px;
        font-weight: bold;
        color: #A29181;
        text-decoration: line-through;

        &.center{
          margin: 0 auto;
        }
      }
    }
  }
}
</style>