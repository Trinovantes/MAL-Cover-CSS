import '@css/main.scss'

// ----------------------------------------------------------------------------
// App
// ----------------------------------------------------------------------------

import { createApp } from '@web/app'

if (DEFINE.IS_DEV && module.hot) {
    module.hot.accept()
}

const { app, router, store } = createApp()

if (window.__INITIAL_STATE__) {
    // We initialize the store state with the data injected from the server
    store.replaceState(window.__INITIAL_STATE__)
}

router.onReady(() => {
    app.$mount('#app', true)
})
