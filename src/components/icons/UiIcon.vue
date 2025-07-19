<template>
  <suspense>
    <IconLoader v-bind="attrs" :name="name" />
  </suspense>
</template>
<script lang="ts" setup>

import IconLoader from "@/components/icons/IconLoader.vue";
import {useAttrs} from "vue";
defineProps<{name:string}>();
const attrs = useAttrs();
</script>