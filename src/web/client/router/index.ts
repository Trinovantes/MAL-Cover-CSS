import { createMemoryHistory, createRouter, createWebHistory, Router } from 'vue-router'
import { routes } from './routes'
import type { AppContext } from '../../AppContext'

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

    if (appContext?.url) {
        await router.push(appContext.url)
    }

    return router
}
