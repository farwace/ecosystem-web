<template>
<div class="chat-box">
  <BunkerButton class="button">
    <div class="btn-content"><span>📨</span><span>Написать<br/> в чат</span></div>
  </BunkerButton>
</div>
</template>
<script lang="ts" setup>
import BunkerButton from "@/components/games/bunker/components/BunkerButton.vue";

</script>
<style lang="scss" scoped>

.chat-box{
  margin-top: 15px;

 :deep(.game-btn__content) {
   padding: 5px 10px;
 }
 .button {
   background: #444;
   color: white;
   border: none;
   line-height: 14px;

   .btn-content {
     display: flex;
     flex-wrap: nowrap;
     align-items: center;
     justify-content: space-between;
     gap: 2px;
   }
 }
}

</style>