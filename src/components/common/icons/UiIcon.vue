<template>
  <suspense>
    <IconLoader @loaded="$emit('loaded')" v-bind="attrs" :name="name" />
  </suspense>
</template>
<script lang="ts" setup>

import IconLoader from "@/components/common/icons/IconLoader.vue";
import {useAttrs} from "vue";
defineProps<{name:string}>();
defineEmits(['loaded']);
const attrs = useAttrs();
</script>