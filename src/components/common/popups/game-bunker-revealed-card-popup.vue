<template>
  <div class="pp-revealed-card" :class="{'ready': isReady}">
    <div class="revealed-card">
      <div class="card-container">
        <div class="card-inner" :class="{'flipped': isFlipped}">
          <!-- Рубашка карты -->
          <div class="card-back">
            <img src="/assets/img/games/bunker/card-back.png" alt="Card back" />
          </div>

          <!-- Лицевая сторона -->
          <div class="card-front">
            <BunkerCard @picture-load="onCardLoad" :card="card" :is-male="!!player?.isMale" :maxHeight="maxHeight" full-width/>
          </div>
        </div>
      </div>
    </div>
    <div class="pp-revealed-card__player" v-if="player && !noPlayer">
      <UserAvatar :first-name="player.name" :avatar="player.avatar" small avatar-small/>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {TPlayer} from "@/components/games/bunker/types.ts";
import type {Card} from "@/components/games/bunker/schemas/schemas/Card.ts";
import {ref, onMounted, computed} from "vue";
import BunkerCard from "@/components/games/bunker/components/BunkerCard.vue";
import UserAvatar from "@/components/pages/Home/UserAvatar.vue";

const props = defineProps<{
  card: Card,
  player?: TPlayer,
  maxHeight: number,
  noPlayer?: boolean,
}>();

const isReady = ref<boolean>(false);
const isFlipped = ref<boolean>(false);

const onCardLoad = () => {
  isReady.value = true;
  setTimeout(() => {
    isFlipped.value = true;
  }, 100);
}

const cMaxHeight = computed(() => `${props.maxHeight}px`);

onMounted(() => {
  setTimeout(() => {
    isFlipped.value = true;
  }, 500);
});

</script>

<style lang="scss" scoped>

.pp-revealed-card{
  opacity: 0;
  transition: opacity 0.3s ease-in;

  &.ready {
    opacity: 1;
  }

  &__player{
    text-align: center;
    display: flex;
    justify-content: center;
    margin-top: 5px;
  }
}

.revealed-card {
  display: flex;
  justify-content: center;
  perspective: 1000px;

}

.card-container {
  width: 100%;
  max-width: var(--max-width, 300px);
  height: v-bind('props.maxHeight + "px"');
  perspective: 1000px;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.5s;
  transform-style: preserve-3d;
  cursor: pointer;
  transform: scale(1) rotateY(0deg);

  .card-back{
    transform: scale(0.5);
    transition: transform 0.5s;
  }

  &.flipped {
    animation: flipWithScale 0.5s forwards;
    .card-back{
      transform: scale(1);
    }
  }
}

@-moz-keyframes flipWithScale {
  0% {
    transform: scale(1) rotateY(0deg);
  }
  50% {
    transform: scale(0.8) rotateY(90deg);
  }
  100% {
    transform: scale(1) rotateY(180deg);
  }
}
@-ms-keyframes flipWithScale {
  0% {
    transform: scale(1) rotateY(0deg);
  }
  50% {
    transform: scale(0.8) rotateY(90deg);
  }
  100% {
    transform: scale(1) rotateY(180deg);
  }
}
@-webkit-keyframes flipWithScale {
  0% {
    transform: scale(1) rotateY(0deg);
  }
  50% {
    transform: scale(0.8) rotateY(90deg);
  }
  100% {
    transform: scale(1) rotateY(180deg);
  }
}
@keyframes flipWithScale {
  0% {
    transform: scale(1) rotateY(0deg);
  }
  50% {
    transform: scale(0.8) rotateY(90deg);
  }
  100% {
    transform: scale(1) rotateY(180deg);
  }
}


.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  backface-visibility: hidden;
  border-radius: 12px;
}

.card-back {
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    height: v-bind(cMaxHeight);
    max-height: 200px;
    object-fit: contain;
    border-radius: 8px;
  }
}

.card-front {
  transform: rotateY(180deg);

}
</style>