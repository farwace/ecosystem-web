<template>
  <div
      class="game"
      :class="{loading: isLoading}"
  >
    <div class="game-header">
      <div class="title">
        Правила игры
      </div>
    </div>
    <div class="game__data">
      <div class="game__content" v-html="gameContent" v-if="gameContent"></div>
    </div>
  </div>
</template>
<script lang="ts" setup>

import {inject, onMounted, ref} from "vue";
import type {IGameApiProvider} from "@/modules/ApiModule/Interfaces/IGameApiProvider.ts";
import {GameApiProviderSymbol} from "@/modules/ApiModule/symbols.ts";
const isLoading = ref<boolean>(true);

const gameApi: IGameApiProvider | undefined  = inject(GameApiProviderSymbol);

const emit = defineEmits(['close']);
const gameContent = ref<string>();

onMounted(() => {
  gameApi?.getGameInfo?.('bunker')?.then((res) => {
    isLoading.value = false;
    if(res?.data?.rules){
      gameContent.value = res?.data?.rules;
    }
  }).finally(() => {
    isLoading.value = false;
  })
});

</script>
<style scoped lang="scss">
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
  }
}


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

  }
}


</style>