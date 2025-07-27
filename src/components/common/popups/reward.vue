<template>
  <div class="reward">
    <div v-if="message" class="reward__title">
      {{ message }}
    </div>
    <div class="items">
      <div v-if="coins" class="item reward__coins">
        {{ coins }} <UiIcon class="small-icon" name="coin" />
      </div>
      <div v-if="experience" class="item reward__experience">
        {{ experience }} <UiIcon class="small-icon" name="experience" />
      </div>
    </div>
    <div>
      <span class="btn-close" @click="$emit('close')">Хорошо</span>
    </div>
  </div>
</template>
<script lang="ts" setup>
import UiIcon from "@/components/common/icons/UiIcon.vue";

defineEmits(['close']);

defineProps<{
  message?:string,
  coins?:number,
  experience?:number,
}>();

</script>

<style lang="scss" scoped>
.reward{
  background-color: var(--bg-color-component);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  color: #9b6c34;
  text-align: center;
  padding: 20px 20px 0;

  &__title{
    font-size: 24px;
    line-height: 22px;
    font-weight: bold;
    text-align: center;
    padding: 10px 12px;
    border-radius: 100px;
    margin-bottom: 15px;

    color: #C99965;
    background-color: #FEE8C7;
    border: 3px solid #F7D7AD;

  }

  .items{
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 20px;
    align-items: center;
  }

  .item{
    font-size: 24px;
    font-weight: bold;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
}

.btn-close{
  margin-top: 25px;
  display: block;
  color: var(--btn-primary-text);
  background-color: #ff955a;
  border-color: var(--btn-primary-border);
  border-style: solid;
  border-width: 2px;
  border-radius: 100px;
  cursor: pointer;
  font-size: 20px;
  font-weight: normal;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.05);
  padding: 8px 16px;
  transition: background-color .3s ease-out, box-shadow .3s ease-out;
  &:hover{
    background-color: #ff8541;
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.1);
  }

}

.small-icon{
  width: 40px;
  height: 40px;
}
</style>