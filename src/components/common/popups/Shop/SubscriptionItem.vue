<template>
  <div class="item">
    <UiIcon @click.prevent.stop="toggleTooltip()" name="info" class="info-icon" v-if="(subscription.description?.length || 0) > 0"/>
    <div class="item__title">
      <div class="picture" v-if="subscription.imageUrl">
        <img :src="subscription.imageUrl" :alt="subscription.name">
      </div>
      <div class="text" :class="{
        'no-photo': !subscription.imageUrl,
      }">
        <div class="text__title">
          <span>
            {{ subscription.name }}
          </span>
        </div>
        <div class="text__description">
          <CoinText :text="subscription.subtitle" />
        </div>
      </div>
    </div>
    <template v-if="canUseTrialSubscription && (subscription?.trialDuration || 0)> 0">
      <div class="item__price">
        <div class="buy-button" @click="openSubscriptionBox(subscription)">
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
        <div class="buy-button" @click="openSubscriptionBox(subscription)">
          {{ subscription.price }}&nbsp;{{ PluralForm(subscription.price, 'голос', 'голоса', 'голосов') }}
        </div>
        <div class="price">
          <div class="old center" v-if="(subscription?.oldPrice || 0) > 0">
            &nbsp;{{ subscription.oldPrice }} {{ PluralForm(subscription.oldPrice, 'голос', 'голоса', 'голосов') }}&nbsp;
          </div>
        </div>
      </div>
    </template>
    <VDropdown
        v-if="(subscription.description?.length || 0) > 0"
        :triggers="[]"
        :shown="isDropdownOpen"
        @update:shown="onDropdownUpdate"
        :container="container"
    >
      <template #popper>
        <div class="subscription-tooltip">
          <CoinText :text="subscription.description" />
        </div>
      </template>
    </VDropdown>
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
import {inject, ref} from "vue";
import type {IPlatformEvents} from "@/modules/EventsModule/Interfaces/IPlatformEvents.ts";
import {PlatformEventsSymbol} from "@/modules/EventsModule/symbols.ts";

defineOptions({
  components: {
    VDropdown,
  },
  directives: {
    vTooltip
  }
});

const bridgeEventsProvider: IPlatformEvents | undefined = inject(PlatformEventsSymbol);

const {canUseTrialSubscription} = storeToRefs(achievementsStore());

const isDropdownOpen = ref<boolean>(false);
const toggleTooltip = () => {
  if(!isDropdownOpen.value){
    isDropdownOpen.value = true;
  }
}

const onDropdownUpdate = (d: any) => {
  if(!d){
    isDropdownOpen.value = false;
  }
}

const props = defineProps<{
  subscription: TShopSubscription,
  container?: HTMLElement
}>();

const openSubscriptionBox = (s: TShopSubscription) => {
  bridgeEventsProvider?.buySubscription(s);
}

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

      &.no-photo{
        padding-left: 5px;
      }

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

      }

      &__description{
        font-size: 9px;
        line-height: 10px;
        font-weight: 500;
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
      transition: background-color .3s ease-out, transform .3s ease-out;
      will-change: transform;
      cursor: pointer;

      &:hover{
        background-color: #eb9567;
        transform: scale3d(1.02, 1.02, 1.02);
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

@media(min-width: 360px){
  .item{
    &__title{
      .text{
        &__title{
          font-size: 12px;
        }
        &__description{
          font-size: 11px;
          line-height: 12px;
          min-height: 72px;
        }
      }
    }

    &__price{
      .buy-button{
        font-size: 14px;
      }
    }
  }
}

[theme=dark]{
  .item{
    background-color: #2e2e2e;
    border-color: #444444;

    .info-icon{
      color: #939393;
    }

    &__price{
      .buy-button{
        background-color: #ff955a;
      }
    }
  }
}
</style>