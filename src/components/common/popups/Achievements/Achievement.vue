<template>
  <div
      class="achievement"
      :class="{
        disabled: !achievement.received,
        completed: achievement.completed && !achievement.received,
      }"
      @click="tryReceive"
  >
    <div
      v-if="!achievement.received && achievement.completed"
    >
      <img class="achievement__picture" :src="`/assets/img/achievements/${achievement.code}.svg`" :alt="achievement.code">
      <div class="achievement__title">
        {{ achievement.name }}
      </div>
      <div class="achievement__description">
        {{ achievement.description }}
      </div>
    </div>
    <VDropdown
        v-else
        :distance="6"
        :placement="'top'"
        :container="outerContainer"
    >
      <img class="achievement__picture" :src="`/assets/img/achievements/${achievement.code}.svg`" :alt="achievement.code">
      <div class="achievement__title">
        {{ achievement.name }}
      </div>
      <div class="achievement__description">
        {{ achievement.description }}
      </div>
      <template #popper>
        <div class="achievement__tooltip">
          <div v-if="achievement.received">
            Награда получена <UiIcon class="inline-icon" name="check"/>
          </div>
          <div v-else>
            Прогресс: {{ achievement.replays }} / {{ achievement.eventReplays }}
            <br/>
            <div v-if="achievement.coins && achievement.coins > 0 || achievement.experience && achievement.experience > 0">Награда:</div>
            <template v-if="achievement.coins && achievement.coins > 0">
              <UiIcon name="coin" class="inline-icon"/> {{ achievement.coins }}
            </template>
            <br/>
            <template v-if="achievement.experience && achievement.experience > 0">
              <UiIcon name="experience" class="inline-icon"/> {{ achievement.experience }}
            </template>

          </div>
        </div>
      </template>
    </VDropdown>
  </div>
</template>
<script lang="ts" setup>
import type {TUserAchievement} from "@/stores/Achievements/Types/TUserAchievement.ts";
import {Dropdown as VDropdown, vTooltip} from "floating-vue";
import UiIcon from "@/components/common/icons/UiIcon.vue";
defineOptions({
  components: {
    VDropdown,
  },
  directives: {
    vTooltip
  }
});

const props = defineProps<{
  achievement: TUserAchievement,
  outerContainer?: HTMLElement
}>();

const emits = defineEmits(['receive']);

const tryReceive = () => {
  if(!props.achievement.received && props.achievement.completed){
    emits('receive');
  }
}

</script>
<style lang="scss" scoped>
.achievement {
  text-align: center;
  word-wrap: break-word;
  position: relative;

  &.disabled {
    opacity: .5;
  }
  &.completed {
    opacity: 1;
    animation: blink-achievement-notify 2s infinite;
    &:after{
      content: '';
      font-weight: bold;
      display: block;
      width: 20px;
      height: 20px;
      position: absolute;
      background-color: #ff9090;
      border-radius: 100%;
      right: -5px;
      top: -5px;
      box-shadow: 0 0 5px rgba(0,0,0,.1);
      background-image: url("/assets/img/white-alarm.svg");
      background-repeat: no-repeat;
      background-position: center;
      background-size: 14px
    }
  }

  &__picture {
    width: 45px;
    height: 45px;
    margin: auto;
    cursor: pointer;
  }

  &__title {
    font-size: 10px;
    margin-bottom: 5px;
    line-height: .8;
    cursor: pointer;
  }

  &__description {
    font-size: 8px;
    line-height: 1;
    cursor: pointer;
  }

  &__tooltip {
    font-size: 12px;
    text-align: center;
  }
}

@-webkit-keyframes blink-achievement-notify {
  0%{
    opacity: 1;
  }
  70%{
    opacity: .5;
  }
  100%{
    opacity: 1;
  }
}
@-moz-keyframes blink-achievement-notify {
  0%{
    opacity: 1;
  }
  70%{
    opacity: .5;
  }
  100%{
    opacity: 1;
  }
}
@keyframes blink-achievement-notify {
  0%{
    opacity: 1;
  }
  70%{
    opacity: .5;
  }
  100%{
    opacity: 1;
  }
}
</style>