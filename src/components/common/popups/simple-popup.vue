<template>
  <div>
    <div v-html="message"></div>
  </div>
</template>
<script lang="ts" setup>
defineProps<{
  message?:string
}>();

</script>
<style lang="scss" scoped>
:deep(.btn){
  padding: 10px 12px 8px 12px;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  flex-shrink: 0;
  cursor: pointer;
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  gap: 6px;
  transition: box-shadow 0.3s ease-out, background-color 0.3s ease-out;

  background-color: #FF7E85;
  color: #FFEDCB;
  box-shadow: 0 4px 0 #F06470;
  &:hover{
    background-color: #ef7178;
    box-shadow: 0 4px 0 #dd5864;
  }

  svg{
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
}
</style>