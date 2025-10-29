<template>
  <div
      class="game"
      :class="{loading: isLoading}"
  >
    <div class="game-header">
      <div class="title">
        {{ contentTitle }}
      </div>
    </div>
    <div class="game__data">
      <div class="game__content coming-soon" :class="[''+code]" v-html="gameContent" v-if="gameContent"></div>
      <div v-if="code == 'callback'">
        <img class="suggest-img" src="/assets/img/games/home/suggest-callback.png" alt="Предложи идею">
      </div>
    </div>
    <div class="game__button will-play" v-if="showVoteButton" @click="voteForGame">
      Буду играть!
    </div>
    <div class="game__button completed" @click="updateNotificationPermissions" v-if="showVoteResultButton">
      Спасибо, Твой голос учтен!
    </div>
    <template v-if="showVoteResultButton && showSubscribeToGroup">
      <div class="subscribe-to-group">
        <div class="subscribe-to-group__subtitle">Не пропусти новости о проекте, вступай в официальное сообщество Лапа Play Вконтакте!</div>
        <div class="game__button will-play" @click="checkSubscribeToGroup">
          Подписаться
        </div>
      </div>
    </template>

    <a href="https://vk.com/write-232362939" target="_blank" class="game__button" v-if="showOfficialGroupButton">
      Написать сообщение <UiIcon name="target-blank" class="inline-icon" />
    </a>


  </div>
</template>
<script lang="ts" setup>

import {computed, inject, onMounted, ref} from "vue";
import type {IGameApiProvider} from "@/modules/ApiModule/Interfaces/IGameApiProvider.ts";
import {GameApiProviderSymbol} from "@/modules/ApiModule/symbols.ts";
import UiIcon from "@/components/common/icons/UiIcon.vue";
import type {IPlatformEvents} from "@/modules/EventsModule/Interfaces/IPlatformEvents.ts";
import {PlatformEventsSymbol} from "@/modules/EventsModule/symbols.ts";
import {storeToRefs} from "pinia";
import {achievementsStore} from "@/stores/Achievements/achievementsStore.ts";
import type {IMetrikaProvider} from "@/modules/MetrikaModule/Interfaces/IMetrikaProvider.ts";
import {MetrikaSymbol} from "@/modules/MetrikaModule/symbols.ts";
const isLoading = ref<boolean>(true);

const gameApi: IGameApiProvider | undefined  = inject(GameApiProviderSymbol);
const bridgeProvider: IPlatformEvents | undefined = inject(PlatformEventsSymbol);
const metrikaProvider: IMetrikaProvider | undefined = inject(MetrikaSymbol);

const {achievementList} = storeToRefs(achievementsStore());

const props = defineProps<{
  contentTitle: string,
  code: string,
}>()

const emit = defineEmits(['close']);
const gameContent = ref<string>();
const hasSent = ref<boolean | null>(null);
onMounted(() => {
  gameApi?.getGameInfo?.(props.code)?.then((res) => {
    if(res?.data?.previewText){
      gameContent.value = res?.data?.previewText;
    }

    if(res?.data?.voteResult === true){
      hasSent.value = true;
    }
    if(res?.data?.voteResult === false){
      hasSent.value = false;
    }

    isLoading.value = false;
  }).finally(() => {
    isLoading.value = false;
  });
});

const showOfficialGroupButton = computed(() => {
  return props.code === 'callback';
});

const showVoteButton = computed(() => {
  return ['quiz', 'voice', 'draw'].indexOf(props.code || '') > -1 && hasSent.value === false;
});
const showVoteResultButton = computed(() => {
  return ['quiz', 'voice', 'draw'].indexOf(props.code || '') > -1 && hasSent.value === true;
});

const showSubscribeToGroup = computed(() => {
  return !!(achievementList.value?.filter?.((a) => a.code === 'group_subscriber' && !a.completed)?.[0]);
});

const checkSubscribeToGroup = () => {
  bridgeProvider?.checkAchievement?.('group_subscriber');
}

const voteForGame = async () => {
  isLoading.value = true;
  try {
    bridgeProvider?.allowNotifications?.();
    const result = await gameApi?.voteForGame?.(props.code);
    if(result?.data){
      hasSent.value = true;
    }
    metrikaProvider?.reachGoal('voteForGame', {code: props.code})
  }
  catch (e){}
  isLoading.value = false;
}

const updateNotificationPermissions = () => {
  bridgeProvider?.allowNotifications?.();
}

</script>
<style scoped lang="scss">
.game{
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



.game-header{
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

.game{
  &__items{
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__content{
    margin-top: 20px;
    :deep(p){
      margin-bottom: 10px;
    }
    :deep(h3){
      margin-bottom: 10px;
    }

    &.coming-soon{
      :deep(p){
        border-radius: 22px;
        border-width: 3px;
        border-style: solid;
        border-color: #939393;
        padding: 10px;
      }
    }

  }

  &__data{
    .suggest-img{
      margin: 20px auto;
      max-width: 40%;
    }
  }

  &__button{
    border-radius: 20px;
    border-width: 4px;
    border-style: solid;
    border-color: #939393;
    color: #939393;
    text-decoration: none;
    cursor: pointer;
    display: flex;
    gap: 4px;
    justify-content: center;
    align-items: center;
    padding: 12px 16px;
    font-weight: bold;

    &.completed{
      opacity: .68;
    }
  }
}

.subscribe-to-group{
  margin-top: 20px;
  text-align: center;

  &__subtitle{
    margin-bottom: 10px;
  }
}

[theme="light"]{
  .game{
    &__content{
      &.quiz{
        :deep(p){
          border-color: #90BDE4;
          background-color: #C8E0F0;
          color: #093B66;
        }
      }
      &.voice{
        :deep(p){
          border-color: #D5A5D5;
          background-color: #F5D6F5;
          color: #6F196F;
        }
      }
      &.draw{
        :deep(p){
          border-color: #DCCF7E;
          background-color: #F2E9B1;
          color: #6F6106;
        }
      }
      &.callback{
        :deep(p){
          border-color: #E89898;
          background-color: #FBD5D5;
          color: #800909;
        }
      }


    }

    &__button{
      color: #E9891A;
      box-shadow: 0 4px 0 #E9891A;
      border-color: #E49E49;
      background-color: #FFC46A;
      background: linear-gradient(0deg, #FFC46A 0%, #FFDD89 100%);
    }
  }
}
[theme="dark"]{
  .title{
    color: #939393;
    background-color: #222222;
    border-color: #363738;
  }

  .game{
    &.loading{
      &:before{
        background-color: rgba(255, 255, 255, 0.1);
      }
    }

    &__button{
      &.will-play{
        background-color: #DE6431;
        border-color: #b65228;
        color: #FFF6E9;
      }
    }
  }

}
</style>