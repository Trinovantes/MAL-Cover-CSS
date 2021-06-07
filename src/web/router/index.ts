import { createRouter, createWebHistory, Router } from 'vue-router'
import { routes } from './routes'

// ----------------------------------------------------------------------------
// Router
// ----------------------------------------------------------------------------

export function createAppRouter(): Router {
    return createRouter({
        history: createWebHistory(),
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
}
