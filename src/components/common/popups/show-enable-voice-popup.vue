<template>
  <div>
    <button @click="onSubmit">Принять</button>
  </div>
</template>
<script lang="ts" setup>
const props = defineProps<{
  submitCallback?: () => void,
}>();

const emit = defineEmits(['close']);

const onSubmit = () => {
  props.submitCallback?.();
  emit('close');
}

</script>
<style lang="scss" scoped>

</style>