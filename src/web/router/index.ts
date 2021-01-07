import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

import routes from './routes'

export function createRouter(): VueRouter {
    return new VueRouter({
        mode: 'history',
        routes: routes,
        fallback: false,
    })
}
