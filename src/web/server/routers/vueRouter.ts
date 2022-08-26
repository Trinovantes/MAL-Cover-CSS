import assert from 'assert'
import { renderToString } from '@vue/server-renderer'
import express from 'express'
import { renderMetaToString } from 'vue-meta/ssr'
import { VueSsrAssetRenderer } from 'vue-ssr-assets-plugin/dist/utils/VueSsrAssetsRenderer'
import { createAsyncHandler } from '../utils/createAsyncHandler'
import { renderCsp } from '../utils/renderCsp'
import type { AppContext } from '@/web/AppContext'
import { RouteName } from '@/web/client/router/routes'
import { HydrationKey, saveStateToDom } from '@/web/client/store/Hydration'
import { useUserStore } from '@/web/client/store/User'
import { createVueApp } from '@/web/createVueApp'

// -----------------------------------------------------------------------------
// Router
// -----------------------------------------------------------------------------

export const vueRouter = express.Router()

vueRouter.use('*', createVueAppHandler())

function createVueAppHandler() {
    assert(DEFINE.MANIFEST_FILE)
    const assetRenderer = new VueSsrAssetRenderer(DEFINE.MANIFEST_FILE)

    return createAsyncHandler(async(req, res) => {
        const targetUrl = res.locals.redirectUrl ?? req.originalUrl
        const appContext: AppContext = {
            url: targetUrl,
            teleports: {},
            _matchedComponents: new Set(),

            req,
            res,
            _modules: new Set(),
            _meta: {},
        }

        const { app, router } = await createVueApp(appContext)

        // Check if Vue matched to a different route
        if (router.currentRoute.value.fullPath !== targetUrl) {
            res.redirect(router.currentRoute.value.fullPath)
            return
        }

        // Render the app on the server
        const appHtml = await renderToString(app, appContext)
        await renderMetaToString(app, appContext)
        const { header, footer } = assetRenderer.renderAssets(appContext._matchedComponents, false)

        // Proxy any cookies from internal fetch calls back to client
        if (appContext.cookieHeaders) {
            res.setHeader('Set-Cookie', appContext.cookieHeaders)
        }

        const status = (router.currentRoute.value.name === RouteName.Error404)
            ? 404
            : 200

        const rawHtml = `
            <!DOCTYPE html>
            <html ${appContext._meta.htmlAttrs ?? ''}>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <link rel="icon" type="image/x-icon" href="/favicon.png">
                <link href="https://fonts.googleapis.com/css2?family=Material+Icons" rel="stylesheet">
                ${header}
                ${appContext.teleports.head ?? ''}
                <script>
                    ${saveStateToDom(HydrationKey.USER, useUserStore(appContext.pinia).$state)};
                </script>
            </head>
            <body ${appContext._meta.bodyAttrs ?? ''} class="${appContext._meta.bodyClasses ?? ''}">
                <noscript>This website requires JavaScript</noscript>
                <div id="app">${appHtml}</div>
                ${footer}
            </body>
            </html>
        `

        const { html, csp } = renderCsp(rawHtml)

        res.setHeader('Content-Type', 'text/html')
        res.setHeader('Content-Security-Policy', csp)
        res.status(status)
        res.send(html)
    })
}
