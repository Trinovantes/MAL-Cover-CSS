import crypto from 'node:crypto'

export function renderCsp(originalHtml: string) {
    let localhost = ''
    let localhostWs = ''

    if (DEFINE.IS_DEV) {
        const webUrl = new URL(DEFINE.WEB_URL)
        localhost = webUrl.host
        localhostWs = `ws://${webUrl.host} *.malcovercss.link:*`
    }

    const nonce = crypto.randomBytes(16).toString('base64')
    const html = originalHtml.replaceAll('<script', `<script nonce="${nonce}"`)
    const csp = [
        "object-src 'none'",
        "base-uri 'self'",
        `connect-src 'self' cloudflareinsights.com *.ingest.sentry.io ${localhostWs}`,
        `script-src 'strict-dynamic' 'nonce-${nonce}' static.cloudflareinsights.com ${localhost}`,
        `style-src 'self' 'unsafe-inline' fonts.googleapis.com ${localhost}`,
        `font-src 'self' fonts.gstatic.com ${localhost}`,
    ].join(';')

    return {
        html,
        csp,
    }
}
