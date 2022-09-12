import { createPinia } from 'pinia'
import { Quasar, Notify } from 'quasar/src/index.all'
import { createSSRApp } from 'vue'
import { createMetaManager, defaultConfig } from 'vue-meta'
import AppLoader from './client/AppLoader.vue'
import ClientOnly from './client/components/ClientOnly.vue'
import CodeBlock from './client/components/CodeBlock.vue'
import ExternalLink from './client/components/ExternalLink.vue'
import LoadingSpinner from './client/components/LoadingSpinner.vue'
import SimpleImage from './client/components/SimpleImage.vue'
import { createAppRouter } from './client/router'
import { useUserStore } from './client/store/User'
import type { AppContext } from './AppContext'
import type { createRouter } from 'vue-router'

type VueApp = {
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
    const router = createAppRouter(pinia)
    app.use(router)

    // Must init UserStore before router executes so nav guard sees init state
    const userStore = useUserStore(pinia)
    await userStore.init(appContext)

    if (appContext) {
        await router.push(appContext.url)
        await router.isReady()
    }

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
