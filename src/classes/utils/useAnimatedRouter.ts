import type {Router, RouteLocationRaw} from 'vue-router'
import {nextTick, ref} from 'vue'
import { useRouter } from 'vue-router'
import {themeStore} from "@/stores/Theme/themeStore.ts";
import {ecosystemStore} from "@/stores/Ecosystem/ecosystemStore.ts";

export function useAnimatedRouter(): Router {
    const router = useRouter()
    const store = themeStore()
    const ecoStore = ecosystemStore()
    const timeout = ref(0);

    const buildPersistentParams = () => {
        const currentSearch = window.location.search.slice(1);
        const combined = currentSearch ? new URLSearchParams(currentSearch) : new URLSearchParams();

        const authParams = (ecoStore.authString || '')
            .replace(/^Bearer\s+/i, '')
            .trim();

        if (authParams) {
            const authSearchParams = new URLSearchParams(authParams);
            authSearchParams.forEach((value, key) => {
                if (!combined.has(key)) {
                    combined.set(key, value);
                }
            });
        }

        return combined;
    };

    const applyPersistentQuery = (target: RouteLocationRaw): RouteLocationRaw => {
        const persistentParams = buildPersistentParams();

        if (typeof target === 'string') {
            const url = new URL(target, window.location.href);
            persistentParams.forEach((value, key) => {
                if (!url.searchParams.has(key)) {
                    url.searchParams.set(key, value);
                }
            });
            return `${url.pathname}${url.search}${url.hash}`;
        }

        const persistentQuery: Record<string, string> = {};
        persistentParams.forEach((value, key) => {
            if (!(key in persistentQuery)) {
                persistentQuery[key] = value;
            }
        });

        return {
            ...target,
            query: {
                ...persistentQuery,
                ...(target.query ?? {}),
            },
        } as RouteLocationRaw;
    };

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
                const nextLocation = applyPersistentQuery(to as RouteLocationRaw);
                /* @ts-ignore */
                await wrapWithAnimation(() => router.push(nextLocation, ...args))
            }
            catch (e) {
                console.error('router push error', e)
            }

        },
        replace: async (to, ...args) => {
            try {
                const nextLocation = applyPersistentQuery(to as RouteLocationRaw);
                /* @ts-ignore */
                await wrapWithAnimation(() => router.replace(nextLocation, ...args))
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
