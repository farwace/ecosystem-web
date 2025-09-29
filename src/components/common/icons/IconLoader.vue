<template>
  <Component :is="icon" />
</template>

<script setup lang="ts">

import {nextTick, ref, watchEffect} from "vue";

interface Props {
  name: string;
}

const props = withDefaults(defineProps<Props>(), {});
const emits = defineEmits(['loaded']);

const icon = ref();

async function getIcon() {
  try {
    const iconsImport = import.meta.glob('@/assets/icons/**/**.svg', {
      eager: false,
    });

    icon.value = await iconsImport[`/src/assets/icons/${props.name}.svg`]();
    await nextTick();
    emits('loaded');
  } catch {
    console.error(`[icons] Icon '${props.name}' doesn't exist in 'assets/icons'`);
  }
}

await getIcon();

watchEffect(() => {
  void getIcon();
});
</script>
