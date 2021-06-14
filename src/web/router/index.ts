import { createMemoryHistory, createRouter, createWebHistory, Router } from 'vue-router'
import { AppContext } from '@/web/app'
import { routes } from './routes'

// ----------------------------------------------------------------------------
// Router
// ----------------------------------------------------------------------------

export async function createAppRouter(ssrContext?: AppContext): Promise<Router> {
    const router = createRouter({
        history: ssrContext !== undefined
            ? createMemoryHistory()
            : createWebHistory(),

        routes,

        scrollBehavior(to) {
            if (to.hash) {
                return {
                    el: to.hash,
                }
            }

            return {
                top: 0,
            }
        },
    })

    if (ssrContext?.url) {
        await router.push(ssrContext.url)
    }

    return router
}
