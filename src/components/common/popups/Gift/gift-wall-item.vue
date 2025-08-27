<template>
<div class="item">
  <div class="item__body" :class="{deactivated: !gift?.sender && !stub, stub: stub}">
    <div class="item__body__picture">
      <img v-if="gift" :src="`/assets/img/gifts/${gift.code}.png`" :alt="gift.code">
    </div>
    <div class="item__body__title">
      <template v-if="gift">
        {{ gift.name }}
      </template>
    </div>
  </div>
</div>
</template>
<script lang="ts" setup>
import type {TGift} from "@/stores/Ecosystem/Types/TGift.ts";

const props = defineProps<{
  gift?: TGift,
  stub?: boolean,
}>();


</script>
<style lang="scss" scoped>
.item{
  flex-shrink: 0;
  width: 75px;
  max-width: calc(100% - 5px);
  margin-bottom: 5px;
  &__body{
    max-width: 100%;
    position: relative;
    &__picture{
      width: 100%;
      padding-top: calc(100% - 6px);
      max-width: 100%;
      background-color: #CDE8FF;
      border: 3px solid #7DBAFF;
      border-radius: 12px;
      overflow: hidden;
      position: relative;
      margin-bottom: 5px;
      img{
        position: absolute;
        width: calc(100% + 10px);
        height: calc(100% + 10px);
        left: -5px;
        top: -5px;

        max-width: unset;
      }
    }

    &__title{
      text-align: center;
      font-size: 8px;
      font-weight: bold;
      background-color: #FFF3DB;
      border: 1px solid rgba(253, 253, 253, .58);
      box-shadow: 0 0 4px rgba(255, 223, 96, 0.7);
      border-radius: 8px;
      padding: 3px 0;
      color: #124887;
      min-height: 2rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    &.deactivated{
      -ms-filter: grayscale(1);
      -webkit-filter: grayscale(1);
      filter: grayscale(1);
    }

    &.stub{
      .item__body__picture{
        -webkit-animation: shine-loading-image 2s infinite ease-out;
        -moz-animation: shine-loading-image 2s infinite ease-out;
        animation: shine-loading-image 2s infinite ease-out;
      }
    }
  }
}


@-webkit-keyframes shine-loading-image {
  0% {
    background-color: rgba(217, 217, 217, 0.3);
  }
  45% {
    background-color: rgba(205, 232, 255, 0.8);
  }
  75% {
    background-color: rgba(205, 232, 255, 0.5);
  }
  100%{
    background-color: rgba(217, 217, 217, 0.3);
  }
}

@-moz-keyframes shine-loading-image {
  0% {
    background-color: rgba(217, 217, 217, 0.3);
  }
  33% {
    background-color: rgba(205, 232, 255, 0.8);
  }
  66% {
    background-color: rgba(205, 232, 255, 0.5);
  }
  100%{
    background-color: rgba(217, 217, 217, 0.3);
  }
}

@keyframes shine-loading-image {
  0% {
    background-color: rgba(217, 217, 217, 0.3);
  }
  33% {
    background-color: rgba(205, 232, 255, 0.8);
  }
  66% {
    background-color: rgba(205, 232, 255, 0.5);
  }
  100%{
    background-color: rgba(217, 217, 217, 0.3);
  }
}

@media(min-width: 400px){
  .item{
    &__body{
      &__title{
        font-size: 9px;
      }
    }
  }
}
[theme=dark]{
  .item{
    &__body{
      &__picture{
        background-color: #222222;
        border-color: #939393;
      }
      &__title{
        background-color: #2e2e2e;
        border-color: #939393;
        color: #939393;
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
      }
    }
  }
}
</style>