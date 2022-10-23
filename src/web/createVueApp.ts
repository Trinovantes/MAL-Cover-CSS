import { createPinia } from 'pinia'
import { Quasar, Notify } from 'quasar'
import { createSSRApp } from 'vue'
import { createMetaManager, defaultConfig } from 'vue-meta'
import AppLoader from './client/AppLoader.vue'
import ClientOnly from './client/components/ClientOnly.vue'
import CodeBlock from './client/components/CodeBlock.vue'
import ExternalLink from './client/components/ExternalLink.vue'
import LazyImage from './client/components/LazyImage.vue'
import { createAppRouter } from './client/router/createAppRouter'
import { useUserStore } from './client/store/User/useUserStore'
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
    app.component('LazyImage', LazyImage)

    // Pinia
    const pinia = createPinia()
    app.use(pinia)

    if (appContext) {
        appContext.pinia = pinia
    }

    // Must init UserStore before router executes so nav guard sees init state
    const userStore = useUserStore(pinia)
    await userStore.init(appContext)

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
