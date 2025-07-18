import {computed, ref, watch} from 'vue'
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', () => {
    const getTheme = ():'light' | 'dark' => {
        const saveTheme = localStorage.getItem("theme");
        if(saveTheme){
            //@ts-ignore
            return saveTheme;
        }else {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
    }

    //@ts-ignore
    const theme = ref<'light' | 'dark'>(getTheme());

    const isDark = computed(() => {
        return theme.value === 'dark'
    })

    const toggleTheme = () => {
        theme.value = theme.value === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('theme' , theme.value);
        localStorage.setItem("theme", theme.value);
    }

    watch(theme, (newVal) => {
        document.documentElement.setAttribute('theme' , newVal);
        localStorage.setItem("theme", newVal);
    },{ immediate: true })

    return {theme, toggleTheme, isDark}
})
