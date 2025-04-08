import { AppContext } from '@/web/AppContext'
import { renderSSRHead } from '@unhead/ssr'
import { VueSsrAssetRenderer } from 'vue-ssr-assets-plugin'

export type RenderedPage = {
    appHtml: string
    unhead: Awaited<ReturnType<typeof renderSSRHead>>
    teleports: AppContext['teleports']
    quasar: AppContext['_meta']
    vueSsrAssets: {
        matchedComponents: Array<string>
    }
    piniaStores: Array<string> // Stringified via saveStateToWindow
}

/**
 * Glues together headers/footers of current page from all the various plugins used
 *  - `@unhead/ssr`
 *  - `quasar`
 *  - `vue-ssr-assets-plugin`
 *  - `pinia`
*/
export function renderRawHtml(htmlTemplate: string, renderedPage: RenderedPage, assetRenderer: VueSsrAssetRenderer, nonce?: string): string {
    const vueSsrAssetsRender = assetRenderer.renderAssets(renderedPage.vueSsrAssets.matchedComponents, {
        scriptCspNonce: nonce,
    })

    const htmlAttrs = (() => {
        let htmlAttrs = ''

        if (renderedPage.quasar.htmlAttrs) {
            htmlAttrs += ' ' + renderedPage.quasar.htmlAttrs
        }

        return htmlAttrs
    })()

    const bodyAttrs = (() => {
        let bodyAttrs = ''

        if (renderedPage.quasar.bodyAttrs) {
            bodyAttrs += ' ' + renderedPage.quasar.bodyAttrs
        }

        if (renderedPage.quasar.bodyClasses) {
            bodyAttrs += ' ' +  `class="${renderedPage.quasar.bodyClasses}"`
        }

        return bodyAttrs
    })()

    const header = (() => {
        let header = ''

        const nonceAttr = nonce ? `nonce="${nonce}"` : ''
        for (const piniaStore of renderedPage.piniaStores) {
            header += `<script ${nonceAttr}>${piniaStore}</script>`
        }

        if (renderedPage.teleports?.head) {
            header += ' ' + renderedPage.teleports?.head
        }

        header += renderedPage.unhead.headTags
        header += vueSsrAssetsRender.header

        return header
    })()

    const footer = (() => {
        let footer = ''

        if (renderedPage.teleports?.body) {
            footer += ' ' + renderedPage.teleports?.body
        }

        footer += renderedPage.unhead.bodyTags
        footer += vueSsrAssetsRender.footer

        return footer
    })()

    let rawHtml = htmlTemplate
    rawHtml = rawHtml.replace('<html>', `<html${htmlAttrs}>`)
    rawHtml = rawHtml.replace('</head>', `${header}</head>`)
    rawHtml = rawHtml.replace('<body>', `<body${bodyAttrs}>`)
    rawHtml = rawHtml.replace('</body>', `${footer}</body>`)
    rawHtml = rawHtml.replace('<div id="app"></div>', `<div id="app">${renderedPage.appHtml}</div>`)
    return rawHtml
}
