import { readFileSync } from 'node:fs'
import { renderToString } from '@vue/server-renderer'
import express from 'express'
import { VueSsrAssetRenderer } from 'vue-ssr-assets-plugin/dist/utils/VueSsrAssetsRenderer'
import { createAsyncHandler } from '@/web/server/utils/createAsyncHandler'
import { renderRawHtml } from '@/web/server/utils/renderRawHtml'
import { createAppContext } from '@/web/AppContext'
import { ROUTE_NAME } from '@/web/client/router/routes'
import { createVueApp } from '@/web/createVueApp'
import { renderSSRHead } from '@unhead/ssr'
import { createHead } from '@unhead/vue/server'
import { createCspNonce } from '../utils/createCspNonce'
import { saveStateToWindow } from '@/web/client/store/Hydration'
import { useUserStore } from '@/web/client/store/User/useUserStore'

export function routeVue() {
    const router = express.Router()
    const assetRenderer = new VueSsrAssetRenderer(DEFINE.SSR_MANIFEST_FILE)
    const htmlTemplate = readFileSync(DEFINE.SSR_HTML_TEMPLATE).toString('utf-8')

    router.use(createAsyncHandler(async(req, res) => {
        const appContext = createAppContext(req, res)
        const head = createHead({ disableDefaults: true })
        const { app, router } = await createVueApp(head, appContext)
        const is404 = (router.currentRoute.value.name === ROUTE_NAME.ERROR_404)

        // Check if Vue matched to a different route
        if (!is404 && router.currentRoute.value.fullPath !== req.originalUrl) {
            res.redirect(router.currentRoute.value.fullPath)
            return
        }

        // Render the app on the server
        const appHtml = await renderToString(app, appContext)
        const unhead = await renderSSRHead(head)
        const renderedPage = {
            appHtml,
            unhead,
            teleports: appContext.teleports,
            quasar: appContext._meta,
            vueSsrAssets: {
                matchedComponents: [...appContext._matchedComponents],
            },
            piniaStores: [
                saveStateToWindow('__INITIAL_USER_STATE__', useUserStore(appContext.pinia).$state),
            ],
        }

        // Proxy any cookies from internal fetch calls back to client
        if (appContext.ssrProxyCookies) {
            res.setHeader('Set-Cookie', appContext.ssrProxyCookies)
        }

        const { nonce, csp } = createCspNonce()
        res.setHeader('Content-Security-Policy', csp)

        const renderedHtml = renderRawHtml(htmlTemplate, renderedPage, assetRenderer, nonce)
        res.setHeader('Content-Type', 'text/html')
        res.status(is404 ? 404 : 200)
        res.send(renderedHtml)
    }))

    return router
}
