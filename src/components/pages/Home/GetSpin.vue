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
      border-color: var(--btn-secondary-border);
      background-color: var(--btn-secondary-bg);
      color: var(--btn-secondary-text);
      display: inline-block;
      padding: 2px 6px;
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
    }
  }
</style>