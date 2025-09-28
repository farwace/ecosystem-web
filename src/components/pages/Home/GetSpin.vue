<template>
  <div class="bonus">
    <ui-icon class="bonus__spinner" name="animated-spin" />
    <div class="bonus__title">
      Получить<br/>бонусы
    </div>
  </div>
</template>
<script lang="ts" setup>
import UiIcon from "@/components/common/icons/UiIcon.vue";
</script>
<style lang="scss" scoped>
  .bonus{
    position: relative;
    padding-bottom: 18px;
    cursor: pointer;
    &__spinner{
      width: 80px;
      height: 80px;
    }

    &__title{
      font-size: 12px;
      line-height: 16px;
      font-weight: 600;
      text-align: center;
      border-radius: 100px;
      cursor: pointer;
      border-width: 2px;
      border-style: solid;
      border-color: #FBE4CD;
      background-color: #FFF6EC;
      color: #BC7D4D;
      display: inline-block;
      padding: 2px 6px 0;
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  [theme="dark"]{
    .bonus{
      &__title{
        background-color: #222222;
        border-color: #363738;
        color: #939393;
      }

      :deep(svg){
        .dark-color-1{
          fill: #141414;
        }
        .dark-color-2{
          fill: #252526;
        }
        .dark-color-3{
          fill: #424242;
        }

      }
    }
  }
</style>