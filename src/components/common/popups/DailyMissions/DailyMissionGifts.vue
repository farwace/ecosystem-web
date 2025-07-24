<template>
  <div class="boxes">
    <div class="boxes-gifts">
      <div
          class="box box-1"
          :class="{
            active: progress > 2,
            checked: false,
          }"
      >
        <UiIcon name="box1"/>
      </div>
      <div
          class="box box-2"
          :class="{
            active: progress > 4,
            checked: false,
          }"
      >
        <UiIcon name="box2"/>
      </div>
      <div
          class="box box-3"
          :class="{
            active: progress > 6,
            checked: false,
          }"
      >
        <UiIcon name="box3"/>
      </div>
    </div>
    <div
        class="boxes__progress"
        ref="progressRef"
    >
      <div
          ref="item3"
          class="item item-3"
          :class="{
            active: progress > 2,
          }"
      >
        3
      </div>
      <div
          ref="item5"
          class="item item-5"
          :class="{
            active: progress > 4,
          }"
      >
        5
      </div>
      <div
          ref="item7"
          class="item item-7"
          :class="{
            active: progress > 6,
          }"
      >
        7
      </div>
    </div>
    <div class="boxes__bg">

    </div>
  </div>
</template>
<script lang="ts" setup>

import UiIcon from "@/components/common/icons/UiIcon.vue";
import {computed, nextTick, onMounted, ref} from "vue";
import {storeToRefs} from "pinia";
import {dailyMissionsStore} from "@/stores/DailyMissions/dailyMissionsStore.ts";

const progressRef = ref<HTMLDivElement>();
const item3 = ref<HTMLDivElement>();
const item5 = ref<HTMLDivElement>();
const item7 = ref<HTMLDivElement>();

const {dailyMissionList} = storeToRefs(dailyMissionsStore());
const isReady = ref<boolean>(false);

const progress = computed(() => {
  if(!isReady.value){
    return 0;
  }
  return dailyMissionList.value.filter(m => m.received)?.length || 0;
})

const progressPercent = computed(() => {
  switch (progress.value){
    case 2:
      return (((item3.value?.getBoundingClientRect()?.x || 0) - (progressRef.value?.getBoundingClientRect()?.x || 0)) / 2) + 'px';
    case 3:
      return (((item3.value?.getBoundingClientRect()?.x || 0) - (progressRef.value?.getBoundingClientRect()?.x || 0)) - 5) + 'px';
    case 4:
      return (((item3.value?.getBoundingClientRect()?.x || 0) - (progressRef.value?.getBoundingClientRect()?.x || 0)) - 5 + (((item5.value?.getBoundingClientRect()?.x || 0) - (progressRef.value?.getBoundingClientRect()?.x || 0)) - 5 )) / 2 + 'px';
    case 5:
      return (((item5.value?.getBoundingClientRect()?.x || 0) - (progressRef.value?.getBoundingClientRect()?.x || 0)) - 5 ) + 'px';
    case 6:
      return (((item5.value?.getBoundingClientRect()?.x || 0) - (progressRef.value?.getBoundingClientRect()?.x || 0)) - 5 + (((item7.value?.getBoundingClientRect()?.x || 0) - (progressRef.value?.getBoundingClientRect()?.x || 0)) - 5 )) / 2 + 'px';
    case 7:
      return (((item7.value?.getBoundingClientRect()?.x || 0) - (progressRef.value?.getBoundingClientRect()?.x || 0)) - 5) + 'px';
    default:
      if(progress.value > 7){
        return 'calc(100% - 50px)';
      }
      return '0%'
  }
});



const progressOpacity = computed(() => {
  if(progress.value < 2){
    return '0';
  }
  return '100%'
});

onMounted(() => {
  nextTick(() => {
    isReady.value = true;
  })
})

</script>
<style lang="scss" scoped>
.boxes{
  font-size: 24px;
  line-height: 22px;
  font-weight: bold;
  text-align: center;
  position: relative;
  padding-bottom: 16px;


  .boxes-gifts{
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-around;
    align-items: end;
    position: relative;
    z-index: 5;
    width: 100%;
    height: 38px;


    .box{
      flex-shrink: 0;
      position: relative;
      filter: saturate(0.6);
      -ms-filter: saturate(0.6);
      -webkit-filter: saturate(0.6);

      &.active{
        filter: unset;
        -ms-filter: unset;
        -webkit-filter: unset;
      }

      &.checked{
        &:after{
          content: '';
          display: block;
          width: 25px;
          height: 25px;
          position: absolute;
          background-color: #7eba70;
          border-radius: 100%;
          right: -5px;
          top: -5px;
          box-shadow: 0 0 5px rgba(0,0,0,.1);
          background-image: url("/assets/img/white-check.svg");
          background-repeat: no-repeat;
          background-position: center;
          background-size: 14px
        }
      }

    }

    .box-1{
      svg{
        width: 50px;
        height: 50px;
      }
    }

    .box-2{
      svg{
        width: 65px;
        height: 65px;
        margin-bottom: -4px;
      }

      &.checked{
        &:after{
          top: 0;
        }
      }
    }

    .box-3{
      svg{
        width: 80px;
        height: 80px;
        margin-bottom: -9px;
      }
      &.checked{
        &:after{
          top: 4px;
        }
      }
    }
  }

  &__bg{
    border-radius: 100px;
    position: absolute;
    width: 100%;
    left: 0;

    color: #C99965;
    background-color: #FEE8C7;
    border: 3px solid #F7D7AD;

    height: 38px;
    bottom: 0;
    z-index: 1;
  }

  &__progress{
    display: flex;
    justify-content: space-around;
    align-items: center;
    position: absolute;
    width: 100%;
    left: 0;
    z-index: 3;
    bottom: 2px;

    &:before{
      content: '';
      display: block;
      position: absolute;
      left: 25px;
      width: calc(100% - 50px);
      border-radius: 100px;
      height: 12px;
      background-color: #FFCD8B;
      border: 1px solid #FFCD8B;
    }
    &:after{
      content: '';
      opacity: v-bind(progressOpacity);
      position: absolute;
      width: v-bind(progressPercent);
      transition: width .8s ease-in-out;
      left: 25px;
      border-radius: 100px;
      height: 12px;
      background-color: #FFEFCC;
      border: 1px solid #DEA55A;
    }


    .item{
      font-weight: 400;
      position: relative;
      width: 21px;
      height: 21px;
      border-radius: 100%;
      background-color: #FFF8E8;
      flex-shrink: 0;
      font-size: 16px;
      z-index: 5;

      &.active{
        background-color: #FFAF7B;
        color: #FFEFCC;
      }

      &.item-5{
        margin-right: 15px;
      }
      &.item-7{
        margin-right: 15px;
      }


    }

  }
}
</style>