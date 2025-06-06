import crypto from 'node:crypto'

export function createCspNonce() {
    let devHosts = ''

    if (DEFINE.IS_DEV) {
        const webUrl = new URL(DEFINE.WEB_URL)
        devHosts = `${webUrl.host} ws://${webUrl.host} *.malcovercss.link:*`
    }

    const nonce = crypto.randomBytes(16).toString('base64')
    const csp = [
        "object-src     'none'",
        "base-uri       'self'",
        `connect-src    'self' cloudflareinsights.com *.ingest.sentry.io ${devHosts}`,
        `script-src     'strict-dynamic' 'nonce-${nonce}'`,
        `style-src      'self' 'unsafe-inline' fonts.googleapis.com ${devHosts}`,
        `font-src       'self' fonts.gstatic.com ${devHosts}`,
    ].join(';')

    return {
        nonce,
        csp,
    }
}
