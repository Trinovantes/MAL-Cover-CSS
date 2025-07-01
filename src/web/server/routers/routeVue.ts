import { readFileSync } from 'node:fs'
import { renderToString } from '@vue/server-renderer'
import express from 'express'
import { renderSSRHead } from '@unhead/ssr'
import { createHead } from '@unhead/vue/server'
import { VueSsrAssetRenderer } from 'vue-ssr-assets-plugin/dist/utils/VueSsrAssetsRenderer.js'
import { createAsyncHandler } from '../utils/createAsyncHandler.ts'
import { createAppContext } from '../../AppContext.ts'
import { createVueApp } from '../../createVueApp.ts'
import { ROUTE_NAME } from '../../client/router/routes.ts'
import { saveStateToWindow } from '../../client/store/Hydration.ts'
import { useUserStore } from '../../client/store/User/useUserStore.ts'
import { createCspNonce } from '../utils/createCspNonce.ts'
import { renderRawHtml } from '../utils/renderRawHtml.ts'

export function routeVue() {
    const router = express.Router()
    const assetRenderer = new VueSsrAssetRenderer(__SSR_MANIFEST_FILE__)
    const htmlTemplate = readFileSync(__SSR_HTML_TEMPLATE__).toString('utf-8')

    router.use(createAsyncHandler(async (req, res) => {
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
