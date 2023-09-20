import { computed, watch } from 'vue'
import { createMemoryHistory, createRouter, createWebHistory, Router } from 'vue-router'
import { useUserStore } from '../store/User/useUserStore'
import { AppContext } from '@/web/AppContext'
import { RouteMetaKey, RouteName, routes } from './routes'

// ----------------------------------------------------------------------------
// Router
// ----------------------------------------------------------------------------

export async function createVueRouter(appContext?: AppContext): Promise<Router> {
    const router = createRouter({
        history: DEFINE.IS_SSR
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
    watch(isLoggedIn, async() => {
        if (router.currentRoute.value.meta[RouteMetaKey.RequireAuth] && !isLoggedIn.value) {
            console.warn(`[403] Cannot stay on ${router.currentRoute.value.fullPath} because isLoggedIn:${isLoggedIn.value}`)
            await router.push({ name: RouteName.Home })
        }
    })

    router.beforeEach((to, from, next) => {
        if (to.meta[RouteMetaKey.RequireAuth] && !isLoggedIn.value) {
            console.warn(`[403] Cannot navigate to ${to.fullPath} because isLoggedIn:${isLoggedIn.value}`)
            next({ name: RouteName.Home })
            return
        }

        next()
    })

    if (appContext?.url) {
        await router.push(appContext?.url)
    }

    return router
}
