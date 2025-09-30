<template>
  <div class="toggle-private">
    <label class="switch" :class="{active: !!value}">
      <input class="switch__input" type="checkbox" :value="value">
      <span class="toggle"></span>
    </label>
  </div>
</template>
<script lang="ts" setup>

const props = defineProps<{
  value?:boolean,
}>();

</script>
<style lang="scss" scoped>
.toggle-private{
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  gap: 10px;
  align-items: center;

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

  &__input{
    display: none;
  }

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
}
</style>