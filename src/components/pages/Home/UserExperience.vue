<template>
  <div class="exp">
    <div class="exp__balance exp__item">
      <div>
        <UiIcon class="exp__icon" name="coin" />
      </div>
      <span class="exp__value">
        {{ strBalance }}
      </span>

    </div>
    <div class="exp__level exp__item">
      <div>
        <UiIcon class="exp__icon" name="experience" />
      </div>
      <div class="exp__level__desc">
        <span class="exp__value">
          {{ strLevel }} Lvl
        </span>
        <div>
          <div class="exp__level__progress">
            <div class="progressbar">
              <div class="progressbar__fill" v-if="nextLevelPercent > 4" :style="{width: `${nextLevelPercent}%`}"></div>
              <div class="progressbar__text">
                {{ experience }} / {{ nextLevelExperience }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import {storeToRefs} from "pinia";
  import {ecosystemStore} from "@/stores/Ecosystem/ecosystemStore.ts";
  import UiIcon from "@/components/common/icons/UiIcon.vue";
  import {computed} from "vue";
  import {prepareNumber} from "@/classes/utils/PrepareNumber.ts";

  const {lvl, experience, nextLevelExperience, balance, popularity, popularityLevel, nextLevelPopularity} = storeToRefs(ecosystemStore());

  const strBalance = computed(() => {
    return prepareNumber(balance.value || 0)
  });
  const strLevel = computed(() => {
    return prepareNumber(lvl.value || 0)
  });

  const nextLevelPercent = computed(() => {
    const exp = experience.value || 0;
    const needExp = (nextLevelExperience.value || 1);
    if(exp < 1 || needExp < 1){
      return 0;
    }

    return Math.round(exp * 100 / needExp);

  })

</script>
<style lang="scss" scoped>
.exp{
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__item{
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: 8px;
  }

  &__balance{
    margin-top: auto;

    .exp__value{
      margin-top: -4px;
    }
  }
  &__level{
    margin-bottom: auto;

    &__desc{
      margin-top: -8px;
    }
    &__progress{
      position: relative;
    }
  }

  &__value{
    font-weight: bolder;
    @media(min-width: 390px){
      font-size: 18px;
    }
  }

  &__icon{
    width: 32px;
    height: 32px;
  }

  .progressbar{
    text-align: center;
    width: 150px;
    height: 12px;
    border-radius: 100px;
    border: 1px solid #F0CA9F;
    background-color: #FADFBE;

    @media(min-width: 390px){
      height: 14px;
    }

    &__fill{
      background-color: #B4D6E3;
      border: 1px solid #9CC1D1;
      position: absolute;
      top: 0;
      height: 100%;
      left: 0;
      border-radius: 100px;
    }

    &__text{
      font-weight: 600;
      font-size: 11px;
      line-height: 11px;
      vertical-align: top;
      position: relative;

      @media(min-width: 390px){
        font-size: 12px;
        line-height: 12px;
      }
    }
  }
}
</style>