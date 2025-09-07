<template>
  <div class="game-btn">
    <div class="game-btn__content">
      <slot/>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.game-btn{
  cursor: pointer;
  border-radius: 5px;
  padding: 2px;

  &__content{
    padding: 5px 15px;
    text-align: center;
    border: 1px solid #E5CC9F;
    color: #E5CC9F;
    border-radius: 4px;
  }
}
</style>