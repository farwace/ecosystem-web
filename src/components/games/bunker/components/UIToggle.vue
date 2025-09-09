<template>
  <div class="toggle-private">
    <label class="switch" :class="{active: !model}">
      <input :id="fieldId" class="switch__input" type="checkbox" v-model="model">
      <span class="toggle"></span>
      <span class="lock">
        <UiIcon name="lock" v-if="model"/>
      </span>
    </label>
  </div>
</template>
<script lang="ts" setup>
import UiIcon from "@/components/common/icons/UiIcon.vue";
const model = defineModel<boolean>();

const props = defineProps<{
  fieldId?:string,
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