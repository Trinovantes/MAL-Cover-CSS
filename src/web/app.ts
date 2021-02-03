import Vue, { ComponentOptions, CreateElement } from 'vue'

// ----------------------------------------------------------------------------
// Quasar
// ----------------------------------------------------------------------------

import Quasar from 'quasar'

Vue.use(Quasar, {
    config: {
        screen: {
            bodyClasses: true,
        },
    },
})

// ----------------------------------------------------------------------------
// App
// ----------------------------------------------------------------------------

import { Store } from 'vuex'
import VueRouter from 'vue-router'
import { Request, Response } from 'express'

import App from '@views/App.vue'
import { createRouter } from '@web/router'
import { createStore, IRootState } from '@web/store'

interface RetVal {
    app: Vue
    router: VueRouter
    store: Store<IRootState>
}

export function createApp(ssrContext?: { req: Request; res: Response }): RetVal {
    const router = createRouter()
    const store = createStore()

    const appOptions: ComponentOptions<Vue> = {
        router: router,
        store: store,
        render: (createElement: CreateElement) => {
            return createElement(App)
        },
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    Quasar.ssrUpdate({
        app: appOptions,
        ssr: ssrContext,
    })

    const app = new Vue(appOptions)

    return { app, router, store }
}
