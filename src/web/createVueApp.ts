import { createPinia } from 'pinia'
import { Quasar, Notify, QuasarPluginOptions } from 'quasar'
import { createSSRApp } from 'vue'
import { createHead } from '@unhead/vue'
import AppLoader from './client/AppLoader.vue'
import ClientOnly from './client/components/ClientOnly.vue'
import CodeBlock from './client/components/CodeBlock.vue'
import ExternalLink from './client/components/ExternalLink.vue'
import { createVueRouter } from './client/router/createVueRouter'
import { useUserStore } from './client/store/User/useUserStore'
import { AppContext } from './AppContext'
import { SSRContext } from '@vue/server-renderer'
import type { createRouter } from 'vue-router'

type VueApp = {
    app: ReturnType<typeof createSSRApp>
    router: ReturnType<typeof createRouter>
    head: ReturnType<typeof createHead>
}

export async function createVueApp(appContext?: AppContext): Promise<VueApp> {
    // Vue
    const app = createSSRApp(AppLoader)
    app.component('ClientOnly', ClientOnly)
    app.component('ExternalLink', ExternalLink)
    app.component('CodeBlock', CodeBlock)

    // Pinia
    const pinia = createPinia()
    app.use(pinia)

    if (appContext) {
        appContext.pinia = pinia
    }

    // Pinia Stores
    const userStore = useUserStore(pinia)
    await userStore.init(appContext)

    // Vue Router
    const router = await createVueRouter(appContext)
    app.use(router)
    await router.isReady()

    // Unhead
    const head = createHead()
    app.use(head)

    // Quasar
    app.use<[Partial<QuasarPluginOptions>, SSRContext?]>(Quasar, {
        plugins: {
            Notify,
        },
    }, appContext)

    return {
        app,
        router,
        head,
    }
}
