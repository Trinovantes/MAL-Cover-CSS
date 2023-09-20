import { AppContext } from '@/web/AppContext'
import { HydrationKey, saveStateToWindow } from '@/web/client/store/Hydration'
import { useUserStore } from '@/web/client/store/User/useUserStore'

export function renderRawHtml(htmlTemplate: string, appContext: AppContext, header: string, footer: string, appHtml: string): string {
    const head = `
        <script>
            ${saveStateToWindow(HydrationKey.UserStore, useUserStore(appContext.pinia).$state)};
        </script>

        ${header}
        ${appContext.teleports?.head ?? ''}
    `

    let rawHtml = htmlTemplate
    rawHtml = rawHtml.replace('<html', `<html ${appContext._meta.htmlAttrs ?? ''}`)
    rawHtml = rawHtml.replace('</head>', `${head}</head>`)
    rawHtml = rawHtml.replace('<body', `<body ${appContext._meta.bodyAttrs ?? ''} class="${appContext._meta.bodyClasses ?? ''}"`)
    rawHtml = rawHtml.replace('</body>', `${appContext.teleports?.body ?? ''}${footer}</body>`)
    rawHtml = rawHtml.replace('<div id="app"></div>', `<div id="app">${appHtml}</div>`)

    return rawHtml
}
