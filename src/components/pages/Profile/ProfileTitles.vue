<template>
  <div class="profile__titles">
    <div class="exp item">
      <ui-icon name="experience" class="title-icon"/>
      Lv. {{ profile?.lvl }}
    </div>
    <div class="pop item" v-if="(profile?.popularityLevel || 0) > 0">

    </div>
  </div>
</template>
<script lang="ts" setup>
import type {TUserProfile} from "@/modules/ApiModule/Types/TUserProfile.ts";
import UiIcon from "@/components/common/icons/UiIcon.vue";

const props = defineProps<{
  profile?:TUserProfile
}>();


</script>
<style lang="scss" scoped>
.profile{
  &__titles{
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    gap: 8px;

    .exp{
      background-color: #FF9379;
      color: #FFEFC2;
    }
    .pop{
      background-color: #E0CEF0;
      color: var(--white);
    }

    .title-icon{
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    .item{
      font-size: 16px;
      font-weight: 600;
      padding: 3px 6px 3px 3px;
      border-radius: 9px;
      display: flex;
      flex-wrap: nowrap;
      flex-direction: row;
      gap: 2px;
      line-height: 16px;
      height: 22px;
      align-items: center;
    }
  }
}
</style>