import { createSSRApp } from 'vue'
import { createAppRouter } from './router'
import AppLoader from './components/AppLoader.vue'
import ClientOnly from './components/Global/ClientOnly.vue'
import ExternalLink from './components/Global/ExternalLink.vue'
import CodeBlock from './components/Global/CodeBlock.vue'
import SimpleImage from './components/Global/SimpleImage.vue'
import { createMetaManager, defaultConfig } from 'vue-meta'
import { Quasar, Notify } from 'quasar'
import { createUserStore, userInjectionKey } from './store/User'
import { Router } from 'vue-router'
import { SSRContext } from '@vue/server-renderer'
import express from 'express'

interface CreatedApp {
    app: ReturnType<typeof createSSRApp>
    router: Router
    userStore: ReturnType<typeof createUserStore>
}

export type AppContext = SSRContext & {
    url: string

    // Required by Quasar
    req: express.Request
    res: express.Response
    _modules: Set<unknown>
    _meta: Record<string, unknown>
}

export async function createApp(ssrContext?: AppContext): Promise<CreatedApp> {
    // Vue
    const app = createSSRApp(AppLoader)
    app.component('ClientOnly', ClientOnly)
    app.component('ExternalLink', ExternalLink)
    app.component('CodeBlock', CodeBlock)
    app.component('SimpleImage', SimpleImage)

    // Vue Router
    const router = await createAppRouter(ssrContext)
    app.use(router)
    await router.isReady()

    // Vuex
    const userStore = createUserStore()
    app.use(userStore, userInjectionKey)

    // Vue Meta
    const metaManager = createMetaManager(DEFINE.IS_SSR, {
        ...defaultConfig,
        'theme-color': {
            tag: 'meta',
            keyAttribute: 'name',
        },
    })
    app.use(metaManager)

    // Quasar
    app.use(Quasar, {
        plugins: {
            Notify,
        },
    }, ssrContext)

    return {
        app,
        router,
        userStore,
    }
}
