import type { AppContext } from '@/web/AppContext'

type Headers = Record<string, string>

export function getRequestHeaders(appContext: AppContext | undefined, headersToProxy: Array<string> = []): Readonly<Headers> {
    if (!appContext) {
        return {}
    }

    const originalHeaders = appContext.req.headers
    if (headersToProxy.length === 0) {
        return originalHeaders as Headers
    }

    const filteredHeaders: Headers = {}
    for (const key of headersToProxy) {
        const val = originalHeaders[key]
        if (val === undefined) {
            continue
        }

        if (Array.isArray(val)) {
            continue
        }

        filteredHeaders[key] = val
    }

    return filteredHeaders
}
