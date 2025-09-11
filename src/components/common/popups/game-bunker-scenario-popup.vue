<template>
  <div class="scenario">
    <img :src="scenario.imageUrl" :alt="scenario.name" />
  </div>
</template>
<script lang="ts" setup>
  import type {TScenario} from "@/components/games/bunker/types.ts";

  const props = defineProps<{
    scenario: TScenario,
  }>();

</script>

<style lang="scss" scoped>
  .scenario {
    display: flex;
    justify-content: center;
    padding-bottom: 50px;
    img{
      width: 100%;
      max-width: 400px;
      object-fit: contain;
    }
  }
</style>