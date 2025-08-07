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
const route = useRoute();

const profileId = (route.params.id || 0) as unknown as number;

</script>
<style lang="scss" scoped>
.profile{
  height: 100%;
  overflow-y: auto;
  position: relative;
  background-color: inherit;
}
</style>