<template>
  <div class="results">
    <div class="results__picture">
      <img :src="pictureSrc" alt="Результат игры">
    </div>
    <div class="results__text">
      <div v-if="experience || coins">
        <div v-if="canShareResult" class="share-result" :class="{won: won}">
          <div class="share-button">
            <div class="btn">
              <template v-if="!won">
                Поделиться поражением
              </template>
              <template v-else>
                Поделиться победой
              </template>

              <div class="share-prize">+100<UiIcon name="middle-money" /></div>
            </div>
          </div>
        </div>
        <div class="results__prize" :class="{won: won, 'can-share': canShareResult}">
          <div>
            Награда:
          </div>
          <div class="items">
            <div class="item" v-if="coins">
              <UiIcon name="middle-money" /> {{ coins }}
            </div>
            <div class="item" v-if="experience">
              <UiIcon name="experience" /> {{ experience }}
            </div>
          </div>
        </div>
      </div>
      <div class="results-button won">
        <div class="btn" @click="$emit('close')">
          Продолжить
        </div>
      </div>


    </div>
  </div>
</template>
<script lang="ts" setup>
import {computed, ref} from "vue";
import UiIcon from "@/components/common/icons/UiIcon.vue";
import type {TUser} from "@/stores/Ecosystem/Types/TUser.ts";

const canShareResult = ref<boolean>(false);

const props = defineProps<{
  user?: TUser,
  won?: boolean,
  experience?: number,
  coins?: number,
}>();

const emits = defineEmits(['close']);

const pictureSrc = computed(() => {
  const male = props.user?.sex != 1;
  const won = props.won;

  if(!won){
    if(male){
      return '/assets/img/games/bunker/male-loose.png';
    }
    else{
      return '/assets/img/games/bunker/female-loose.png';
    }

  }
  else{
    if(male){
      return '/assets/img/games/bunker/male-won.png';
    }
    else{
      return '/assets/img/games/bunker/female-won.png';
    }
  }
})

</script>
<style lang="scss" scoped>

.share-result{
  position: absolute;
  right: 0;
  left: 0;
  top: -50px;

  &.won{
    top: -25px;
  }
}

.share-button{
  margin-top: 20px;
  display: flex;
  justify-content: center;
  .btn{
    position: relative;
    text-align: center;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: 2px;
    border-radius: 100px;
    background-color: #DEA753;
    border: 3px solid #5C3000;
    color: #5C3000;
    padding: 4px 10px;
    font-weight: bold;
    white-space: nowrap;
  }

  svg{
    width: 20px;
    height: 20px;
  }

  .share-prize{
    position: absolute;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 2px;
    background-color: #E68500;
    border-radius: 100px;
    padding: 1px 4px;
    right: -20px;
    top: -22px;
    font-size: 14px;
    font-weight: bold;
    color: #FFDC79;
    border: 2px solid #5C3000;
  }
}

.loose__text{
  position: relative;
  .results-button{
    margin-top: -25px;
  }
}

.results{
  margin-top: auto;
  margin-bottom: auto;
  display: flex;
  flex-direction: column;

  &__picture{
    margin-left: auto;
    margin-right: auto;
    max-width: 280px;

    img{
      object-fit: contain;
    }
  }

  &__prize{
    margin-bottom: 10px;

    .items{
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      margin-top: 5px;
      .item{
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 2px;
        svg{
          width: 30px;
          height: 30px;
        }
      }
    }


    &.won{
      &.can-share{
        padding-top: 24px;
      }
    }
  }

  &__text{
    max-width: 280px;
    margin-left: auto;
    margin-right: auto;
    text-align: center;
    position: relative;
    color: #8D593B;
    font-size: 18px;
    line-height: 20px;
    font-weight: bold;
    background-color: #FFEFCC;
    border-radius: 12px;
    padding: 10px;

  }

  .results-button{
    //position: absolute;
    //margin-top: -50px;
    //width: calc(100% - 20px);

    z-index: 2;
    display: flex;
    justify-content: center;

    &.won{
      .btn{
        border-color: #cb7500;
      }
    }

    .btn{
      border-radius: 100px;
      font-size: 16px;
      font-weight: bold;
      color: #FFDC79;
      background-color: #E68500;
      border: 3px solid #5C3000;
      padding: 10px 20px;
      line-height: 16px;
      cursor: pointer;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
      transition: background-color .3s ease-out, box-shadow .3s ease-out, color .3s ease-out;

      &:hover{
        background-color: #FFDC79;
        color: #E68500;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
      }
    }
  }
}
</style>