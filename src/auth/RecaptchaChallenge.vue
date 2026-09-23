<template>
  <div ref="container" class="recaptcha-challenge"></div>
</template>

<script setup lang="ts">
import {onMounted, onBeforeUnmount, ref} from 'vue';
import {renderFallbackRecaptcha, type RecaptchaWidget} from './recaptcha';

const emit = defineEmits<{
  verified: [token: string],
  error: [message: string],
}>();

const container = ref<HTMLElement | null>(null);
let widget: RecaptchaWidget | null = null;

onMounted(async () => {
  if (!container.value) return;

  try {
    widget = await renderFallbackRecaptcha(
      container.value,
      (token) => emit('verified', token),
      () => emit('error', 'Не удалось загрузить капчу. Обновите страницу и попробуйте снова.'),
    );
  } catch (error) {
    emit('error', error instanceof Error ? error.message : 'Не удалось загрузить капчу.');
  }
});

onBeforeUnmount(() => {
  widget?.reset();
});

defineExpose({
  reset: () => widget?.reset(),
});
</script>

<style scoped>
.recaptcha-challenge {
  display: flex;
  justify-content: center;
  margin: 16px 0;
}
</style>
