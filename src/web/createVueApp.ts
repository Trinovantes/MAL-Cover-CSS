import { createPinia } from 'pinia'
import { Quasar, Notify } from 'quasar/src/index.all'
import { createSSRApp } from 'vue'
import { createMetaManager, defaultConfig } from 'vue-meta'
import AppLoader from './client/components/AppLoader.vue'
import ClientOnly from './client/components/Global/ClientOnly.vue'
import CodeBlock from './client/components/Global/CodeBlock.vue'
import ExternalLink from './client/components/Global/ExternalLink.vue'
import LoadingSpinner from './client/components/Global/LoadingSpinner.vue'
import SimpleImage from './client/components/Global/SimpleImage.vue'
import { createAppRouter } from './client/router'
import type { AppContext } from './AppContext'
import type { createRouter } from 'vue-router'

interface VueApp {
    app: ReturnType<typeof createSSRApp>
    router: ReturnType<typeof createRouter>
}

export async function createVueApp(appContext?: AppContext): Promise<VueApp> {
    // Vue
    const app = createSSRApp(AppLoader)
    app.component('ClientOnly', ClientOnly)
    app.component('ExternalLink', ExternalLink)
    app.component('CodeBlock', CodeBlock)
    app.component('LoadingSpinner', LoadingSpinner)
    app.component('SimpleImage', SimpleImage)

    // Pinia
    const pinia = createPinia()
    app.use(pinia)

    if (appContext) {
        appContext.pinia = pinia
    }

    // Vue Router
    const router = await createAppRouter(appContext)
    app.use(router)
    await router.isReady()

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
    }, appContext)

    return {
        app,
        router,
    }
}
