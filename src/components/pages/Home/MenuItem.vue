<template>
<div class="menu-item">
  <ui-icon class="menu-item__icon" :name="props.icon" />
  <slot></slot>
</div>
</template>
<script lang="ts" setup>

import UiIcon from "@/components/common/icons/UiIcon.vue";

const props = defineProps<{icon: string}>();

</script>
<style lang="scss" scoped>
.menu-item {
  cursor: pointer;
  display: flex;
  position: relative;
  flex-direction: column;
  align-items: center;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 600;
  flex-grow: 1;
  &.unread{
    &:after{
      position: absolute;
      width: 20px;
      height: 20px;
      content: '';
      background: #ff9090;
      border-radius: 100%;
      right: 5px;
      top: -7px;
      border: 2px solid #FFF6E9;
    }
  }
  &__icon{
    width: 44px;
    height: 44px;
    margin-bottom: 4px;
  }
}
[theme=dark] {
  .menu-item{
    &:hover{
      :deep(svg){
        .dark-bg-2{
          fill: #ababab;
        }
      }
    }
    :deep(svg){
      .dark-bg-1{
        fill: #141414;
      }
      .dark-bg-2{
        fill: #939393;
        transition: fill .3s ease-out;
      }

    }
  }
}
</style>