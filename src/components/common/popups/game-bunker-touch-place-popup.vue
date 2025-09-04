<template>
  <div class="bunker-popup">
    <div class="bunker-popup__title">Подтвердите действие</div>
    <div class="bunker-popup__text">Занять место {{ placeNumber }} или пригласить друга?</div>
    <div class="bunker-popup__buttons">
      <div class="btn btn-invite" @click="inviteFriend()">
        Пригласить
      </div>
      <div class="btn btn-place" @click="changePlace()">
        Занять
      </div>

    </div>
  </div>
</template>
<script lang="ts" setup>
const props = defineProps<{
  changePlaceCallback?: () => void,
  inviteFriendCallback?: () => void,
  placeNumber?: number
}>();

const emit = defineEmits(["close"]);

const inviteFriend = () => {
  props?.inviteFriendCallback?.();
  emit("close");
}

const changePlace = () => {
  props?.changePlaceCallback?.();
  emit("close");
}


</script>
<style lang="scss" scoped>
.bunker-popup{
  padding: 20px 15px;
  text-align: center;

  &__title{
    font-size: 20px;
    margin-bottom: 10px;
    font-weight: 500;
  }
  &__text{
    margin-bottom: 20px;
    font-size: 1rem;
    line-height: 1rem;
  }

  &__buttons{
    display: flex;
    flex-wrap: nowrap;
    gap: 10px;
    line-height: 1rem;
  }

  .btn {
    padding: 10px 12px 8px 12px;
    border-radius: 100px;
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    flex-shrink: 0;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    gap: 6px;


    transition: box-shadow .3s ease-out, background-color .3s ease-out;

    &.btn-place{
      background-color: #FF7E85;
      color: #FFEDCB;
      box-shadow: 0 4px 0 #F06470;
      &:hover{
        background-color: #ef7178;
        box-shadow: 0 4px 0 #dd5864;
      }
    }

    &.btn-invite{
      background-color: #89D8EF;
      color: #fdfdfd;
      box-shadow: 0 4px 0 #64C9EB;
      &:hover{
        background-color: #7fcee4;
        box-shadow: 0 4px 0 #59bbdb;
      }
    }
  }
}
</style>