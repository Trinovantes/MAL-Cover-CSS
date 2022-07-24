import crypto from 'crypto'

export function renderCsp(originalHtml: string): { html: string; csp: string } {
    const nonce = crypto.randomBytes(16).toString('base64')
    const html = originalHtml.replaceAll('<script', `<script nonce="${nonce}"`)
    const csp = `
        object-src 'none';
        base-uri 'self';
        connect-src 'self' cloudflareinsights.com *.ingest.sentry.io;
        script-src 'strict-dynamic' 'nonce-${nonce}' 'unsafe-eval' static.cloudflareinsights.com;
        style-src 'self' 'unsafe-inline' fonts.googleapis.com;
        font-src fonts.gstatic.com;
    `.replaceAll('\n', ' ')

    return {
        html,
        csp,
    }
}
