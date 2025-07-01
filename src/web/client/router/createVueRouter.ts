import { computed, watch } from 'vue'
import { createMemoryHistory, createRouter, createWebHistory, type Router } from 'vue-router'
import { useUserStore } from '../store/User/useUserStore.ts'
import { ROUTE_NAME, ROUTE_META_KEY, routes } from './routes.ts'
import type { AppContext } from '../../AppContext.ts'

// ----------------------------------------------------------------------------
// Router
// ----------------------------------------------------------------------------

export async function createVueRouter(appContext?: AppContext): Promise<Router> {
    const router = createRouter({
        history: __IS_SSR__
            ? createMemoryHistory()
            : createWebHistory(),

        routes,

        scrollBehavior(to, from, savedPosition) {
            if (to.hash) {
                return { el: to.hash }
            }

            if (savedPosition) {
                return savedPosition
            }

            if (to.path !== from.path) {
                return { top: 0 }
            }

            return undefined
        },
    })

    const userStore = useUserStore(appContext?.pinia)
    const isLoggedIn = computed(() => userStore.user !== null)
    watch(isLoggedIn, async () => {
        if (router.currentRoute.value.meta[ROUTE_META_KEY.REQUIRE_AUTH] && !isLoggedIn.value) {
            console.warn(`[403] Cannot stay on ${router.currentRoute.value.fullPath} because isLoggedIn:${isLoggedIn.value}`)
            await router.push({ name: ROUTE_NAME.HOME })
        }
    })

    router.beforeEach((to, from, next) => {
        if (to.meta[ROUTE_META_KEY.REQUIRE_AUTH] && !isLoggedIn.value) {
            console.warn(`[403] Cannot navigate to ${to.fullPath} because isLoggedIn:${isLoggedIn.value}`)
            next({ name: ROUTE_NAME.HOME })
            return
        }

        next()
    })

    if (appContext?.url) {
        await router.push(appContext?.url)
    }

    return router
}
