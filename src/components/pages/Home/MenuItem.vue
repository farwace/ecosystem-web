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
  flex-direction: column;
  align-items: center;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 600;
  flex-grow: 1;
  &__icon{
    width: 44px;
    height: 44px;
    margin-bottom: 2px;
  }
}
</style>