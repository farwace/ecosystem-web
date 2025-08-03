<template>
  <ProfileComponent :profile-id="profileId" />
</template>
<script setup lang="ts">
import ProfileComponent from "@/components/pages/Profile/ProfileComponent.vue";
import {useRoute} from "vue-router";
const route = useRoute();

const profileId = (route.params.id || 0) as unknown as number;

</script>