<template>
  <div class="profile">
    <suspense>
      <ProfileComponent :profile-id="profileId" />
      <template #fallback>
        <LoadingPage />
      </template>
    </suspense>
  </div>
</template>
<script setup lang="ts">
import ProfileComponent from "@/components/pages/Profile/ProfileComponent.vue";
import {useRoute} from "vue-router";
import LoadingPage from "@/components/pages/LoadingPage.vue";
import type {IPlatformEvents} from "@/modules/EventsModule/Interfaces/IPlatformEvents.ts";
import {inject, onMounted} from "vue";
import {PlatformEventsSymbol} from "@/modules/EventsModule/symbols.ts";
const route = useRoute();

const profileId = (route.params.id || 0) as unknown as number;

const bridgeProvider: IPlatformEvents | undefined = inject(PlatformEventsSymbol);
onMounted(() => {
  bridgeProvider?.displayBottomBn?.();
})

</script>
<style lang="scss" scoped>
.profile{
  height: 100%;
  overflow-y: auto;
  position: relative;
  background-color: inherit;
}
</style>