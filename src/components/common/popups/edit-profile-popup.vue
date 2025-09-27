<template>
  <div class="edit-profile">
    <div :class="{ 'profile-loading': isLoading }">
      <div class="item">
        <div class="item__title">Имя:</div>
        <div class="item__value">
          <TextInput
              v-if="editName"
              v-model="userFirstName"
              @change="validateName"
              :maxlength="19"
          />
          <div v-else class="item__static">{{ userFirstName }}</div>
        </div>
        <button @click.stop="toggleEdit('name')">
          <template v-if="editName">
            <UiIcon class="icon-check" name="check-circle" />
          </template>
          <template v-else>
            <UiIcon class="icon-check" name="edit-pen" />
          </template>
        </button>
      </div>

      <div class="item">
        <div class="item__title">Талисман:</div>
        <div class="item__value">
          <div v-if="editAnimal" class="animal-selection">
            <div
                v-for="a in animals"
                :key="a"
                class="animal-option"
                :class="{ selected: userAnimal === a }"
                @click="userAnimal = a"
            >
              <UiIcon :name="`animals/${a}`" class="animal-icon" />
            </div>
          </div>
          <UiIcon v-else class="animal" :name="`animals/${animal}`" />
        </div>
        <button @click.stop="toggleEdit('animal')">
          <template v-if="editAnimal">
            <UiIcon class="icon-check" name="check-circle" />
          </template>
          <template v-else>
            <UiIcon class="icon-check" name="edit-pen" />
          </template>
        </button>
      </div>

      <div class="item">
        <div class="item__title">Пол:</div>
        <div class="item__value">
          <div v-if="editSex" class="animal-selection">
            <div
                class="sex-option"
                :class="{ selected: userSex == 1 }"
                @click="userSex = 1"
            >
              <UiIcon name="female" class="icon" />
            </div>
            <div
                class="sex-option"
                :class="{ selected: userSex == 2 }"
                @click="userSex = 2"
            >
              <UiIcon name="male" class="icon" />
            </div>
          </div>
          <div v-else class="item__static sex-option"><UiIcon class="icon" v-if="sex" :name="sex == 1 ? 'female' : 'male'"/></div>
        </div>
        <button @click.stop="toggleEdit('sex')">
          <template v-if="editSex">
            <UiIcon class="icon-check" name="check-circle" />
          </template>
          <template v-else>
            <UiIcon class="icon-check" name="edit-pen" />
          </template>
        </button>
      </div>

      <div class="item">
        <div class="item__title">Возраст:</div>
        <div class="item__value">
          <select v-if="editAge" v-model="userAge">
            <option :value="AgeGroup['zoomer']">До 18</option>
            <option :value="AgeGroup['millenial']">18–30</option>
            <option :value="AgeGroup['doomer']">30–45</option>
            <option :value="AgeGroup['boomer']">45+</option>
          </select>
          <div v-else class="item__static">{{ ageLabel }}</div>
        </div>
        <button @click.stop="toggleEdit('age')">
          <template v-if="editAge">
            <UiIcon class="icon-check" name="check-circle" />
          </template>
          <template v-else>
            <UiIcon class="icon-check" name="edit-pen" />
          </template>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { ecosystemStore } from '@/stores/Ecosystem/ecosystemStore.ts'
import { inject, ref, computed } from 'vue'
import UiIcon from '@/components/common/icons/UiIcon.vue'
import TextInput from '@/components/common/ui/forms/TextInput.vue'
import { isClean } from '@/classes/utils/Profanity.ts'
import type { INotificationsProvider } from '@/modules/NotificationsModule/Interfaces/INotificationsProvider.ts'
import { NotificationsSymbol } from '@/modules/NotificationsModule/symbols.ts'
import {AgeGroup} from "@/stores/Ecosystem/IEcosystemStore.ts";
import type {IUserProvider} from "@/modules/ApiModule/Interfaces/IUserProvider.ts";
import {UserProviderSymbol} from "@/modules/ApiModule/symbols.ts";

const notificationsProvider: INotificationsProvider | undefined = inject<INotificationsProvider>(NotificationsSymbol);
const userProvider: IUserProvider | undefined = inject<IUserProvider>(UserProviderSymbol);
const { sex, firstName, animal, ageGroup } = storeToRefs(ecosystemStore())

const userFirstName = ref(firstName.value || '');
const userSex = ref(sex.value || 0);
const userAnimal = ref(animal.value || '');
const userAge = ref((ageGroup?.value || '').toString());

const editName = ref(false)
const editAnimal = ref(false)
const editSex = ref(false)
const editAge = ref(false)

const isLoading = ref(false)
const animals = ['tiger', 'cat', 'chicken', 'fox', 'koala', 'panda']

const ageLabel = computed(() => {
  switch (userAge?.value || '') {
    case '1': return 'До 18'
    case '2': return '18–30'
    case '4': return '30–45'
    case '8': return '45+'
    default: return 'Не указан'
  }
})

function validateName() {
  if (!isClean(userFirstName.value)) {
    userFirstName.value = firstName.value
    notificationsProvider?.addNotification({
      type: 'warning',
      message: 'Обнаружены запрещенные символы, имя восстановлено'
    })
  }
}

const toggleEdit = async (field: 'name' | 'animal' | 'sex' | 'age') => {
  if(isLoading.value) return;
  isLoading.value = true;
  try {
    switch (field) {
      case 'name':
        if (editName.value){
          if(userFirstName.value && userFirstName.value != firstName.value){
            await userProvider?.updateProfile({
              'name': userFirstName.value
            })
          }
          editName.value = false;
        }
        else{
          editName.value = true;
        }
        break
      case 'animal':
        if (editAnimal.value){
          if(userAnimal.value){
            await userProvider?.updateProfile({
              'animal': userAnimal.value
            })
          }

          editAnimal.value = false;
        }
        else{
          editAnimal.value = true;
        }

        break
      case 'sex':
        if (editSex.value){
          if(userSex.value){
            await userProvider?.updateProfile({
              'sex': userSex.value.toString()
            })
          }
          editSex.value = false;
        }
        else{
          editSex.value = true;
        }

        break
      case 'age':
        if (editAge.value){
          if(userAge.value){
            await userProvider?.updateProfile({
              'ageGroup': userAge.value
            })
          }
          editAge.value = false;
        }
        else{
          editAge.value = true;
        }

        break
    }
  }
  catch (e: any){}
  finally {
    isLoading.value = false;
  }

}
</script>

<style lang="scss" scoped>
.edit-profile {
  .animal {
    width: 40px;
    height: 40px;
    margin-left: 4px;
  }

  .animal-selection {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .animal-option {
    width: 40px;
    height: 40px;
    cursor: pointer;
    border-radius: 6px;
    border: 2px solid transparent;
    transition: border-color 0.2s;
    &.selected {
      border-color: #c49c7a;
    }
  }

  .sex-option {
    width: 34px;
    height: 34px;
    cursor: pointer;
    border-radius: 6px;
    border: 2px solid transparent;
    transition: border-color 0.2s;

    &.item__static{
      padding: 0!important;
      margin-left: 8px;
    }

    .icon{
      width: 30px;
      height: 30px;
    }
    &.selected {
      border-color: #c49c7a;
    }
  }

  .animal-icon {
    width: 100%;
    height: 100%;
  }

  .item {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    gap: 10px;

    &__title {
      width: 100px;
      font-weight: 500;
    }

    &__value {
      flex: 1;
    }

    .item__static {
      padding: 8px 12px;
      background: #fff6ef;
      border-radius: 8px;
    }

    select,
    input {
      padding: 8px 12px;
      border: 1px solid #d6bfa9;
      border-radius: 8px;
      background: #fff8f1;
      font-size: 14px;
      color: #5c4a3c;
    }

    button {
      padding: 6px 12px;
      border-radius: 8px;
      background: #f1e1d0;
      border: none;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.2s;
      height: 34px;
      &:hover {
        background: #e4d4c2;
      }
    }
  }

  .icon-check{
    width: 20px;
    height: 20px;
  }

  .profile-loading{
    opacity: .7;
    pointer-events: none;
  }
}

[theme=dark]{
  .edit-profile{
    .item{
      .item__static{
        background: #2e2e2e;
      }
      button{
        background: #2e2e2e;
      }
      select{
        background: #141414;
        border-color: #2e2e2e;
        color: #939393;
      }
      input{
        color: #939393;
        background-color: #141414;
        border-color: #2e2e2e;
      }
    }
    .sex-option{
      &.selected{
        border-color: #939393;
      }
    }
    .animal-option{
      &.selected{
        border-color: #939393;
      }
    }
  }
}
</style>