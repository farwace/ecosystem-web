<template>
  <span>
    <template v-for="(part, index) in parsed" :key="index">
      <template v-if="part === '__COIN__'">
        <UiIcon class="inline-icon" name="coin" />
      </template>
      <template v-else>
        {{ part }}
      </template>
    </template>
  </span>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import UiIcon from '@/components/common/icons/UiIcon.vue'

const props = defineProps<{
  text: string
}>()

const parsed = computed(() => {
  return props.text
      .split('#coin#')
      .flatMap((chunk, index, arr) => index < arr.length - 1 ? [chunk, '__COIN__'] : [chunk])
      .filter(Boolean)
})
</script>