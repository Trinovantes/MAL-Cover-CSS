import { readFileSync } from 'node:fs'
import { renderToString } from '@vue/server-renderer'
import express from 'express'
import { VueSsrAssetRenderer } from 'vue-ssr-assets-plugin/dist/utils/VueSsrAssetsRenderer'
import { createAsyncHandler } from '@/web/server/utils/createAsyncHandler'
import { renderCsp } from '@/web/server/utils/renderCsp'
import { renderRawHtml } from '@/web/server/utils/renderRawHtml'
import { createAppContext } from '@/web/AppContext'
import { RouteName } from '@/web/client/router/routes'
import { createVueApp } from '@/web/createVueApp'
import { renderSSRHead } from '@unhead/ssr'

export function routeVue() {
    const router = express.Router()
    const assetRenderer = new VueSsrAssetRenderer(DEFINE.SSR_MANIFEST_FILE)
    const htmlTemplate = readFileSync(DEFINE.SSR_HTML_TEMPLATE).toString('utf-8')

    router.use(createAsyncHandler(async(req, res) => {
        const appContext = createAppContext(req, res)
        const { app, router, head } = await createVueApp(appContext)
        const is404 = (router.currentRoute.value.name === RouteName.Error404)

        // Check if Vue matched to a different route
        if (!is404 && router.currentRoute.value.fullPath !== req.originalUrl) {
            res.redirect(router.currentRoute.value.fullPath)
            return
        }

        // Render the app on the server
        const appHtml = await renderToString(app, appContext)
        const payload = await renderSSRHead(head)
        const { header, footer } = assetRenderer.renderAssets(appContext._matchedComponents)
        const rawHtml = renderRawHtml(htmlTemplate, appContext, header + payload.headTags, footer + payload.bodyTags, appHtml)
        const { html, csp } = renderCsp(rawHtml)

        // Proxy any cookies from internal fetch calls back to client
        if (appContext.ssrProxyCookies) {
            res.setHeader('Set-Cookie', appContext.ssrProxyCookies)
        }

        res.setHeader('Content-Type', 'text/html')
        res.setHeader('Content-Security-Policy', csp)
        res.status(is404 ? 404 : 200)
        res.send(html)
    }))

    return router
}
