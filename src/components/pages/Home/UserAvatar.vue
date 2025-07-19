<template>
  <div class="avatar">
    <div class="avatar__img">
      <img :src="photo" alt="">
    </div>
    <div class="avatar__name">
      <div ref="avatarName" class="avatar__name__value">
        {{ firstName }}
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import {storeToRefs} from "pinia";
  import {ecosystemStore} from "@/stores/Ecosystem/ecosystemStore.ts";
  import {computed, onMounted, ref} from "vue";

  const {firstName, avatar} = storeToRefs(ecosystemStore());

  const photo = computed(() => {
    return avatar?.value || '/assets/img/avatar-stub.png'
  });

  const avatarName = ref<HTMLDivElement>();
  onMounted(() => {
    if(avatarName.value){
      if(avatarName.value.scrollWidth > avatarName.value.clientWidth){
        avatarName.value.classList.add('marquee');
        avatarName.value.style.setProperty('--marquee-width', `-${avatarName.value.scrollWidth - avatarName.value.clientWidth}px`);
      }
    }
  })
</script>
<style lang="scss" scoped>
.avatar{
  position: relative;
  width: 68px;
  padding-bottom: 27px;
  &__img{
    position: relative;
    width: 68px;
    height: 68px;
    border: 3px solid var(--white);
    border-radius: 22px;
    overflow: hidden;
    box-shadow: 0 0 10px rgba(254, 227, 185, 1);
    img{
      width: 100%;
      object-fit: cover;
    }
  }

  &__name{
    font-weight: bolder;
    margin-top: 5px;
    position: absolute;
    max-width: 100%;
    overflow: hidden;
    white-space: nowrap;

    &__value{
      &.marquee {
        animation: marquee 10s linear infinite;
      }
    }



    @media(min-width: 390px){
      font-size: 18px;
    }
  }
}

@keyframes marquee {
  0% {transform: translateX(0%);}
  50% {transform: translateX(var(--marquee-width));}
  52% {transform: translateX(var(--marquee-width));}
  98% {transform: translateX(0%);}
  100% {transform: translateX(0%);}
}
</style>