<template>
  <div>
    <div class="help-reduce" v-if="code=='reduce-players'">
      <div class="help-reduce__icon">
        <UiIcon name="chevron-left"></UiIcon>
      </div>
      <div>
        Вы можете уменьшить<br/>количество слотов для старта
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import UiIcon from "@/components/common/icons/UiIcon.vue";

const props = defineProps<{
  code: string
}>()
</script>
<style lang="scss" scoped>
.help-reduce{
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  text-align: right;
  background-color: rgba(255,255,255,.05);
  width: 280px;
  padding: 2px 10px;
  border-radius: 12px;
  position: fixed;
  top: 10px;
  top: calc(env(safe-area-inset-top,0) + 10px);
  left: 58px;

  &__icon{
    display: flex;
    flex-direction: column;
    justify-content: center;

    svg{
      width: 20px;
      height: 20px;
    }
  }
}
</style>