<template>
  <div class="item" :class="{stub:stub}">
    <div class="item__position">
      {{ position }}
    </div>
    <div class="item__body">
      <div class="item__picture">
        <img :src="avatarUrl" :alt="user.firstName">
      </div>
      <div class="item__description">
        <img v-if="user.premium" class="vip" src="/assets/img/popularity/vip.png" alt="vip">
        <div class="content">
          <div class="name" :class="{'vip-name': user.premium}">
            {{ user.firstName }}
          </div>
          <div class="value">
            <span class="value__label">
              Популярность:
            </span>
            <span class="value__value">
              {{ prepareNumber(user.popularity) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {computed} from 'vue';
import type {TUser} from "@/stores/Ecosystem/Types/TUser.ts";
import {prepareNumber} from "@/classes/utils/PrepareNumber.ts";

const props = defineProps<{
  position: number,
  user: TUser,
  stub?: boolean
}>();

const allowedAnimals = ['cat', 'chicken', 'koala', 'fox', 'panda', 'tiger'];

const avatarUrl = computed(() => {
  if (props.user.avatar) {
    return props.user.avatar;
  }

  const animal = props.user.animal && allowedAnimals.includes(props.user.animal)
    ? props.user.animal
    : 'tiger';

  return `/assets/img/animals/${animal}.svg`;
});
</script>

<style lang="scss" scoped>
.item{
  display: flex;
  flex-wrap: nowrap;
  cursor: pointer;
  align-items: center;
  gap: 10px;

  &__position{
    flex-shrink: 0;
    width: 15px;
    text-align: center;
  }

  &__body{
    flex-grow: 1;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    width: 100%;
    overflow: hidden;
    min-width: 0;
  }

  &__picture{
    flex-shrink: 0;
    border-radius: 100%;
    overflow: hidden;
    padding: 10px;
    width: 88px;
    height: 88px;
    position: relative;
    z-index: 2;
    border: 2px solid var(--card-border);
    background-color: var(--card-bg);

    img{
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 100%;
    }
  }
  &__description {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    position: relative;

    img.vip{
      width: 30px;
      object-fit: contain;
      position: absolute;
      right: 0;
      top: 0;
    }

    .content{
      border: 2px solid var(--card-border);
      background-color: var(--card-bg);
      margin: auto 0 auto -40px;
      padding: 8px 10px 8px 48px;
      border-radius: 12px;
    }
  }

  .name{
    color: #946240;
    font-size: 20px;
    font-weight: 700;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .value {
    color: #CBA882;

    &__label {
      font-size: 14px;
      font-weight: 400;
    }

    &__value {
      font-size: 18px;
      font-weight: 500;
    }
  }

  &.stub{
    .item{
      &__picture{
        overflow: hidden;
        img{
          overflow: visible;
          border-radius: unset;
          width: 100px;
          height: 100px;
          object-fit: contain;

        }
      }
    }
  }
}

[theme=dark]{
  .item{
    .name{
      color: #939393;
    }
    .value{
      color: #939393;
    }
  }
}
</style>
