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