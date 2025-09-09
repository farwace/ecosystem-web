<template>
  <div class="toggle-private">
    <div class="switch" v-if="host" :class="{active: !props.value}">
      <div class="toggle"></div>
      <div class="lock">
        <UiIcon name="lock" v-if="props.value"/>
      </div>
    </div>
    <div class="toggle-private__text">
      Поиск игроков: {{ props.value ? 'Выкл': 'Вкл' }}
    </div>
  </div>
</template>
<script lang="ts" setup>
import UiIcon from "@/components/common/icons/UiIcon.vue";

const props = defineProps<{
  value?:boolean,
  host?:boolean,
}>();


</script>
<style lang="scss" scoped>
.toggle-private{
  margin-top: 10px;
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  gap: 10px;
  align-items: center;

  &__text{
    font-size: 10px;
    font-weight: 400;
  }
}
.switch{
  height: 24px;
  width: 42px;
  border-radius: 100px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  padding: 0 2px;
  background-color: #f5b6b6;
  transition: background-color 0.1s ease-out;
  position: relative;
  color: #321D02;
  cursor: pointer;


  &.active{
    background-color: #F5D8B6;
    .toggle{
      margin-left: 18px;
    }
  }
  .toggle{
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    background-color: #321D02;
    border-radius: 50%;
    margin-left: 0;
    transition: margin-left 0.1s ease-out;
  }

  .lock{
    position: absolute;
    right: 4px;
    top: 4px;
    svg{
      width: 15px;
      height: 15px;
    }
  }
}
</style>