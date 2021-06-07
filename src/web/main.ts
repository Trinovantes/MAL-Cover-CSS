import './assets/css/main.scss'
import { createApp } from 'vue'
import { createAppRouter } from './router'
import AppLoader from './components/AppLoader.vue'
import ClientOnly from './components/Global/ClientOnly.vue'
import ExternalLink from './components/Global/ExternalLink.vue'
import CodeBlock from './components/Global/CodeBlock.vue'
import { createMetaManager, defaultConfig } from 'vue-meta'
import { Quasar, Notify } from 'quasar'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { createUserStore, userInjectionKey } from './store/User'

dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)

async function main() {
    // Vue
    const app = createApp(AppLoader)
    app.component('ClientOnly', ClientOnly)
    app.component('ExternalLink', ExternalLink)
    app.component('CodeBlock', CodeBlock)

    // Vue Router
    const router = createAppRouter()
    app.use(router)
    await router.isReady()

    // Vuex
    const userStore = createUserStore()
    app.use(userStore, userInjectionKey)

    // Vue Meta
    const metaManager = createMetaManager(!!DEFINE.IS_PRERENDER, {
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
    })

    app.mount('#app')
}

main().catch((err) => {
    console.warn(err)
})
