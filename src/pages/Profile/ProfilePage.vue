<template>
  <div>

    <div class="page-container">
      <pre>
        {{route.params}}
      </pre>
      <pre>
        {{ profile }}
      </pre>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {useRoute, useRouter} from "vue-router";
import {inject, onMounted, ref} from "vue";
import { Swiper } from "swiper/vue";
import type {IUserProvider} from "@/modules/ApiModule/Interfaces/IUserProvider.ts";
import {UserProviderSymbol} from "@/modules/ApiModule/symbols.ts";
import type {TUserProfile} from "@/modules/ApiModule/Types/TUserProfile.ts";

const route = useRoute();
const router = useRouter();
const profileId = route?.params?.id;

const userProvider:IUserProvider | undefined = inject(UserProviderSymbol);
const profile = ref<TUserProfile | undefined>();
const isLoading = ref<boolean>(true);


onMounted(async () => {
  if(!profileId || !parseInt(profileId.toString())){
    await router.push({path: '/', replace: true});
  }

  isLoading.value = true;
  try {
    profile.value = (await userProvider?.getProfile(profileId as unknown as number))?.data;
  }
  catch (e: any){}
  finally {
    isLoading.value = false;
  }

});



</script>
<style lang="scss" scoped>
.page-container{
  padding: 20px;
  max-height: 100%;
  overflow-y: auto;
}
</style>
