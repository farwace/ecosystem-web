<template>
  <div class="big-gifts-outer">
    <transition-group name="big-gifts" appear>
      <div v-for="(gift, key) in bigGifts" :key="key" class="item">
        <div class="item__wrap">
          <img :src="`/assets/img/gifts/${gift.gift.code}.png`" :alt="gift.gift.code" class="item__img">
        </div>
      </div>
    </transition-group>
  </div>
</template>
<script lang="ts" setup>
import {storeToRefs} from "pinia";
import {notificationsStore} from "@/stores/Notifications/notificationsStore.ts";

const {bigGifts} = storeToRefs(notificationsStore());

</script>
<style lang="scss">
/* styles */
.big-gifts-outer {
  .item {
    position: fixed;
    left: 50%;
    top: 20%;
    z-index: 10050;
    transform: translate(-50%, 0);
    will-change: transform, opacity;
    pointer-events: none;

    /* постоянное плавание внутри карточки */
    .item__wrap {
      animation: gift-float 1800ms ease-in-out infinite alternate;
      will-change: transform;
    }

    .item__img {
      display: block;
      width: 50vw;
      max-width: 400px;
      height: auto;
      filter: drop-shadow(0 8px 16px rgba(0,0,0,.25));
    }
  }
}

/* Вход */
.big-gifts-enter-active,
.big-gifts-appear-active {
  animation: gift-in 600ms cubic-bezier(.22,1,.36,1) both;
}
@keyframes gift-in {
  0%   { opacity: 0; transform: translate(-50%, 24px) scale(.7) rotate(-6deg); }
  60%  { opacity: 1; transform: translate(-50%, -6px) scale(1.05) rotate(2deg); }
  100% { opacity: 1; transform: translate(-50%, 0)   scale(1)    rotate(0deg); }
}

/* Выход */
.big-gifts-leave-active {
  animation: gift-out 450ms ease both;
}
@keyframes gift-out {
  0%   { opacity: 1; transform: translate(-50%, 0)    scale(1)   rotate(0deg); }
  100% { opacity: 0; transform: translate(-50%, -60px) scale(.9) rotate(-3deg); }
}

/* Непрерывное плавание дочернего контейнера */
@keyframes gift-float {
  0% { transform: translate3d(6px, -14px, 0) rotate(1.5deg); }
  100%   { transform: translate3d(0, 0, 0) rotate(-1.5deg); }
}

/* На случай reduce motion */
@media (prefers-reduced-motion: reduce) {
  .item__wrap { animation: none; }
}


</style>