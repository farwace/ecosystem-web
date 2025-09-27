<template>
  <div class="avatar" :class="{alarm: alarm, 'no-padding': onlyPhoto}">
    <div class="avatar__img__outer">
      <div class="avatar__img" :class="{small: avatarSmall}">
        <img :src="photo" alt="">
      </div>
      <img v-if="vip" class="vip" src="/assets/img/popularity/vip.png" alt="vip">
    </div>
    <div v-if="!onlyPhoto" class="avatar__name" :class="{small: small}">
      <div ref="avatarName" class="avatar__name__value">
        {{ firstName }}
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import {computed, onMounted, ref} from "vue";

  const props = defineProps<{
    firstName: string,
    avatar?: string,
    small?: boolean,
    avatarSmall?:boolean,
    alarm?:boolean,
    onlyPhoto?: boolean,
    vip?:boolean
  }>();

  const photo = computed(() => {
    return props.avatar || '/assets/img/avatar-stub.png'
  });

  const avatarName = ref<HTMLDivElement>();
  onMounted(() => {
    setTimeout(() => {
      if(avatarName.value){
        if(avatarName.value.scrollWidth > avatarName.value.clientWidth){
          avatarName.value.classList.add('marquee');
          avatarName.value.style.setProperty('--marquee-width', `-${avatarName.value.scrollWidth - avatarName.value.clientWidth}px`);
          let speed = (avatarName.value.scrollWidth - avatarName.value.clientWidth)/5;
          if(speed < 10) {speed = 10}
          avatarName.value.style.setProperty('--marquee-duration', `${speed}s`);
        }
      }
    }, 2000)
  })
</script>
<style lang="scss" scoped>
.avatar{
  position: relative;
  width: 68px;
  padding-bottom: 27px;
  cursor: pointer;
  &.no-padding{
    padding-bottom: 0;
  }
  &.alarm{
    &:after{
      position: absolute;
      content: '';
      width: 15px;
      height: 15px;
      background: #ff9090;
      border-radius: 100%;
      right: 4px;
      top: 0;
      border: 2px solid #FFF6E9;
      animation: blink-user-notify 2s infinite;
    }
  }

  img.vip{
    position: absolute;
    width: 30px;
    object-fit: contain;
    bottom: -5px;
    right: -5px;
  }

  &__img{
    position: relative;
    width: 68px;
    height: 68px;
    border: 3px solid #FFF6E9;
    border-radius: 22px;
    overflow: hidden;
    box-shadow: 0 0 10px rgba(254, 227, 185, 1);
    &__outer{
      position: relative;
      width: 68px;
      height: 68px;
    }
    img{
      width: 100%;
      object-fit: cover;
    }

    &.small{
      width: 48px;
      height: 48px;
      border-radius: 18px;
      margin-left: auto;
      margin-right: auto;
    }
  }

  &__name{
    font-weight: bolder;
    margin-top: 5px;
    position: absolute;
    max-width: 100%;
    overflow: hidden;
    white-space: nowrap;

    &.small{
      font-weight: bold;
      font-size: 14px;
      width: 100%;
      text-align: center;
      color: #BA7D50;
    }

    &__value{
      &.marquee {
        -webkit-animation: marquee var(--marquee-duration) ease-in-out infinite;
        -moz-animation: marquee var(--marquee-duration) ease-in-out infinite;
        animation: marquee var(--marquee-duration) ease-in-out infinite;
      }
    }
  }
}

@-webkit-keyframes marquee {
  0% {transform: translateX(0%);}
  40% {transform: translateX(var(--marquee-width));}
  52% {transform: translateX(var(--marquee-width));}
  90% {transform: translateX(0%);}
  100% {transform: translateX(0%);}
}

@-moz-keyframes marquee {
  0% {transform: translateX(0%);}
  40% {transform: translateX(var(--marquee-width));}
  52% {transform: translateX(var(--marquee-width));}
  90% {transform: translateX(0%);}
  100% {transform: translateX(0%);}
}

@keyframes marquee {
  0% {transform: translateX(0%);}
  40% {transform: translateX(var(--marquee-width));}
  52% {transform: translateX(var(--marquee-width));}
  90% {transform: translateX(0%);}
  100% {transform: translateX(0%);}
}

@-webkit-keyframes blink-user-notify {
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
@-moz-keyframes blink-user-notify {
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
@keyframes blink-user-notify {
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


@media(min-width: 390px){
  .avatar{
    &__name{
      font-size: 18px;
    }
  }
}

[theme=dark] .avatar{
  &__img{
    box-shadow: 0 0 10px rgba(0, 0, 0, .1);
  }
  &__name{
    &.small{
      color: #939393;
    }
  }
}
</style>