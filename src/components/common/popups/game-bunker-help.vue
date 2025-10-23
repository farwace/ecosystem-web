<template>
  <div class="game-help-tooltips" @click="$emit('close')">
    <div class="help-reduce" v-if="code=='reduce-players'">
      <div class="help-reduce__icon">
        <UiIcon name="chevron-left"></UiIcon>
      </div>
      <div>
        Уменьшите количество <br/> слотов для старта
      </div>
      <div class="help-reduce__icon alarm-icon">
        <UiIcon name="alarm"></UiIcon>
      </div>
    </div>
    <div class="help-press-ready" v-if="code=='press-ready' && helpPressReadyTop">
      <div class="help-press-ready__icon alarm-icon">
        <UiIcon name="alarm"></UiIcon>
      </div>
      <div>
        Нажмите готов
      </div>
      <div class="help-press-ready__icon">
        <UiIcon name="chevron-down"></UiIcon>
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>
import UiIcon from "@/components/common/icons/UiIcon.vue";
import {nextTick, onMounted, ref} from "vue";

const props = defineProps<{
  code: string
}>();
defineEmits(["close"]);
const helpPressReadyTop = ref<string>();
const helpPressReadyLeft = ref<string>();

onMounted(() => {
  const readyBtn = document.querySelector('.bunker__controls .buttons .ready');
  if(readyBtn){
    const rect = readyBtn?.getBoundingClientRect?.();
    if(rect?.top){
      helpPressReadyTop.value = (rect.top - 48) + 'px';
      helpPressReadyLeft.value = (rect.left - 158) + 'px';
    }
  }
})

</script>
<style lang="scss" scoped>
.game-help-tooltips{
  color: #939393;
}
.help-press-ready{
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 10px;
  justify-content: space-between;
  text-align: right;
  background-color: rgba(0,0,0,.3);
  padding: 2px 10px;
  border-radius: 12px;
  line-height: 28px;
  font-size: 20px;
  position: fixed;

  top: v-bind(helpPressReadyTop);
  left: v-bind(helpPressReadyLeft);

  &__icon{
    display: flex;
    flex-direction: column;
    justify-content: center;

    svg{
      width: 22px;
      height: 22px;
    }
  }
}
.help-reduce{
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 10px;
  justify-content: space-between;
  text-align: right;
  background-color: rgba(0,0,0,.3);
  padding: 2px 10px;
  border-radius: 12px;
  line-height: 18px;
  font-size: 17px;
  position: fixed;
  top: 12px;
  top: calc(env(safe-area-inset-top,0) + 12px);
  left: 48px;

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

.alarm-icon{
  animation: blink-alarm-icon 1.8s infinite;
  -webkit-animation: blink-alarm-icon 1.8s infinite;
}

@-webkit-keyframes blink-alarm-icon {
  0%{
    opacity: .2;
  }
  70%{
    opacity: 1;
  }
  100%{
    opacity: .2;
  }
}
@-moz-keyframes blink-alarm-icon {
  0%{
    opacity: .2;
  }
  70%{
    opacity: 1;
  }
  100%{
    opacity: .2;
  }
}
@keyframes blink-alarm-icon {
  0%{
    opacity: .2;
  }
  70%{
    opacity: 1;
  }
  100%{
    opacity: .2;
  }
}
</style>