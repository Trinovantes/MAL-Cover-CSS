import { computed } from 'vue'
import { createMemoryHistory, createRouter, createWebHistory, RouteLocationNormalized, Router } from 'vue-router'
import { useUserStore } from '../store/User'
import type { AppContext } from '@/web/AppContext'
import { RouteMetaKey, RouteName, routes } from './routes'

// ----------------------------------------------------------------------------
// Router
// ----------------------------------------------------------------------------

export async function createAppRouter(appContext?: AppContext): Promise<Router> {
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

            return { top: 0 }
        },
    })

    const userStore = useUserStore(appContext?.pinia)
    const isLoggedIn = computed(() => userStore.currentUser !== null)
    const canVisitRoute = (to: RouteLocationNormalized) => {
        if (!isLoggedIn.value && to.meta[RouteMetaKey.RequireAuth]) {
            return false
        }
        if (isLoggedIn.value && to.meta[RouteMetaKey.RequireUnauth]) {
            return false
        }

        return true
    }

    router.beforeEach((to, from, next) => {
        if (canVisitRoute(to)) {
            next()
        } else {
            console.warn(`Cannot navigate to ${to.fullPath} because isLoggedIn:${isLoggedIn.value}`)
            next({ name: RouteName.Home })
        }
    })

    if (appContext?.url) {
        await router.push(appContext?.url)
    }

    return router
}
