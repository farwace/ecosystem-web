import {defineStore} from "pinia";
import type {IThemeStore} from "@/stores/Theme/IThemeStore.ts";

export const themeStore = defineStore('theme', {
    state: (): IThemeStore => ({
        theme: 'light',
        animateRoute: false,
        customSwipeSettings: false,
        musicVolume: '50',
        soundVolume: '50',
        voiceVolume: '50',
        clientInfo: {
            platform: '-',
            app: 'vk',
            version: '1.0.0'
        }
    }),
    getters: {
        isDark(state): boolean {
            return state.theme === 'dark';
        }
    },
})