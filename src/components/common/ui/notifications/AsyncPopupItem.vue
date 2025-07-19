<template>
  <component
      :is="comp"
      v-if="comp"
      v-bind="props.data"
      @vue:mounted="onReady"
      @close="onClose"
  />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'

const onReady = (data: any) => {
  emits('ready', data)
}

const onClose = (data: any) => {
  emits('close', data)
}

const props = defineProps({
  component: {
    type: String,
    default: '',
  },
  data: {
    type: Object,
    default: () => {}
  },
})

const emits = defineEmits(['ready', 'close'])

const comp = computed(() => {
  try {
    return defineAsyncComponent(() => import(`./../../popups/${props.component}.vue`).catch((e) => {
      // eslint-disable-next-line no-console
      console.warn(`[AsyncComponent] Component "${props.component}" wasn't found in Sections path`)
      emits('close')

      return undefined
    }))
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`[AsyncComponent] Component "${props.component}" wasn't found in Sections path`)
    emits('close')

    return undefined
  }
})

</script>
