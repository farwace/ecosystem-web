<template>
  <div class="daily-rewards">
    <div class="daily-rewards__title">
      Ежедневная награда
    </div>
    <div class="daily-rewards__subtitle">
      <template v-if="(consecutiveDays || 0) == 1">
        Рады видеть тебя в игре!
      </template>
      <template v-if="(consecutiveDays || 0) > 1">
        <div>
          Рады видеть тебя снова!
        </div>
        <div>
          Твой прогресс: {{ consecutiveDays }} {{ PluralForm((consecutiveDays || 0), 'день', 'дня', 'дней') }} подряд!
        </div>
      </template>
    </div>
    <UiIcon class="daily-enter-photo" name="images/daily-enter" />
    <div v-if="dailyRewards" class="daily-rewards__list">
      <template v-for="reward in dailyRewards">
        <div class="item__outer">
          <div
              class="item"
              :class="{
                active: reward.active
              }"
          >
            <div class="item__content">
              <div class="item__days">
                <div class="item__days-number">
                  {{ reward.from }} {{ reward.to ? `- ${reward.to}` : '+' }}
                </div>
                <div class="item__days-text">
                  дней
                </div>
              </div>
              <div class="item__reward">
                {{ reward.reward }} <UiIcon class="coin-icon" name="coin" />
              </div>
            </div>
          </div>

          <div
              class="item__point"
              :class="{
                active: reward.active,
              }"
          >
          </div>
        </div>
      </template>
      <div class="enter-progress"></div>
    </div>
    <div class="daily-rewards__alert">
      Заходи каждый день и получай больше бесплатных монет!
    </div>
    <div class="daily-rewards__receive">
      <span class="get-reward" @click="receiveDailyReward">
        Забрать награду
      </span>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type {TDailyReward} from "@/modules/EventsModule/Types/TDailyRevard.ts";
import {PluralForm} from "@/classes/utils/PluralForm.ts";
import UiIcon from "@/components/common/icons/UiIcon.vue";
import {computed, inject, ref} from "vue";
import {UserProviderSymbol} from "@/modules/ApiModule/symbols.ts";
import type {IUserProvider} from "@/modules/ApiModule/Interfaces/IUserProvider.ts";
import type {INotificationsProvider} from "@/modules/NotificationsModule/Interfaces/INotificationsProvider.ts";
import {NotificationsSymbol} from "@/modules/NotificationsModule/symbols.ts";

const userProvider: IUserProvider | undefined = inject(UserProviderSymbol);
const notificationsProvider: INotificationsProvider | undefined = inject(NotificationsSymbol);

const props = defineProps<{
  consecutiveDays?: number,
  dailyRewards?: TDailyReward[]
}>();

const emit = defineEmits(['close']);

const isLoading = ref<boolean>(false);

const activeReward = computed(() => {
  return props.dailyRewards?.filter(r => r.active)?.[0] || null;
})

const receiveDailyReward = async () => {
  isLoading.value = true;
  try {
    const res = await userProvider?.receiveDailyEnter();

    if(res?.data && activeReward.value){
      notificationsProvider?.addPopup('daily-reward-received', 'reward', {
        darkBg: true,
        modal: true,
        noTitle: true,
        coins: activeReward.value.reward,
        message: 'Награда получена'
      });
    }

    emit('close');
  }
  catch (e: any){}
  finally {
    isLoading.value = false;
  }
}

</script>

<style lang="scss" scoped>
.daily-rewards{
  background-color: var(--bg-color-component);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  color: #9b6c34;
  text-align: center;
  padding: 20px;

  &__title{
    font-size: 24px;
    line-height: 22px;
    font-weight: bold;
    text-align: center;
    padding: 10px 12px;
    border-radius: 100px;
    margin-bottom: 15px;

    color: #C99965;
    background-color: #FEE8C7;
    border: 3px solid #F7D7AD;
  }

  &__subtitle{
    margin-bottom: 15px;
  }

  &__alert{
    margin-top: 15px;
    margin-bottom: 15px;
  }

  &__list{
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    font-size: 14px;
    gap: 3px 2px;
    line-height: 14px;
    justify-content: space-between;
    margin-left: -10px;
    margin-right: -10px;
    @media(min-width: 390px){
      margin-left: 0;
      margin-right: 0;
    }

    .item{
      white-space: nowrap;
      color: #c28d54;
      background-color: #FEE8C7;
      border: 3px solid #F7D7AD;
      border-radius: 8px;
      padding: 6px 2px 4px;
      position: relative;

      &.active{
        &:after{
          @media(min-width: 390px){
            display: none;
          }
          content: '';
          position: absolute;
          top: -10px;
          right: -5px;
          border-radius: 100%;
          background-color: #5c985c;
          width: 15px;
          height: 15px;
          background-image: url("/assets/img/white-check.svg");
          background-size: 10px;
          background-position: center;
          background-repeat: no-repeat;
        }
      }

      &__outer{
        flex-shrink: 0;
        flex-grow: 1;
      }

      &__days{

        margin-bottom: 8px;

        &-text{
          font-size: 12px;
        }

      }

      &__point{
        display: none;
        width: 15px;
        height: 15px;
        border: 3px solid #F7D7AD;
        border-radius: 100%;
        background-color: #FEE8C7;
        margin: 5px auto 0;
        position: relative;
        z-index: 2;

        &.active{
          background-color: #5c985c;
          border: none;
          width: 18px;
          height: 18px;
          background-image: url("/assets/img/white-check.svg");
          background-size: 10px;
          background-position: center;
          background-repeat: no-repeat;
        }

        @media(min-width: 390px){
          display: block;
        }
      }

    }

    .coin-icon{
      width: 12px;
      height: 12px;
      vertical-align: middle;
      margin-bottom: 2px;
    }
  }
}
.daily-enter-photo{
  width: 100%;
  max-width: 400px;
  max-height: 20vh;
}
.get-reward{
  display: block;
  color: var(--btn-primary-text);
  background-color: #ff955a;
  border-color: var(--btn-primary-border);
  border-style: solid;
  border-width: 2px;
  border-radius: 100px;
  cursor: pointer;
  font-size: 20px;
  font-weight: normal;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.05);
  padding: 8px 16px;
  transition: background-color .3s ease-out, box-shadow .3s ease-out;
  &:hover{
    background-color: #ff8541;
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.1);
  }

}

.enter-progress{
  width: 100%;
  background-color: #FEE8C7;
  height: 8px;
  border: 2px solid #F7D7AD;
  border-radius: 100px;
  z-index: 1;
  position: absolute;
  bottom: 5px;
  display: none;
  @media(min-width: 390px){
    display: block;
  }
}
</style>