<template>
  <div>
    <div>{{message}}</div>
  </div>
</template>
<script lang="ts" setup>
defineProps<{
  message?:string
}>();

</script>