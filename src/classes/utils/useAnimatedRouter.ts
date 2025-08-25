import type { Router } from 'vue-router'
import {nextTick, ref} from 'vue'
import { useRouter } from 'vue-router'
import {themeStore} from "@/stores/Theme/themeStore.ts";

export function useAnimatedRouter(): Router {
    const router = useRouter()
    const store = themeStore()
    const timeout = ref(0);

    const wrapWithAnimation = async (navigateFn: () => Promise<void>) => {
        clearTimeout(timeout.value);
        store.$patch({ animateRoute: true })
        await nextTick()
        await navigateFn()
        // optionally reset back to false later if needed:
        await nextTick();
        timeout.value = setTimeout(() => {
            store.$patch({ animateRoute: false })
        }, 500);

    }

    return {
        ...router,
        push: async (to, ...args) => {
            try {
                /* @ts-ignore */
                await wrapWithAnimation(() => router.push(to, ...args))
            }
            catch (e) {
                console.error('router push error', e)
            }

        },
        replace: async (to, ...args) => {
            try {
                /* @ts-ignore */
                await wrapWithAnimation(() => router.replace(to, ...args))
            }
            catch (e){
                console.error('route replace error', e)
            }

        },
        back: async (...args) => {
            await wrapWithAnimation(() => {
                router.back(...args)
                return Promise.resolve()
            })
        }
    } as Router
}
