import {defineStore} from "pinia";
import type {IThemeStore} from "@/stores/Theme/IThemeStore.ts";

export const themeStore = defineStore('theme', {
    state: (): IThemeStore => ({
        theme: 'light',
        animateRoute: false,
        customSwipeSettings: false,
    }),
    getters: {
        isDark(state): boolean {
            return state.theme === 'dark';
        }
    },
})