import type { AppContext } from '@/web/AppContext'

type Headers = Record<string, string>

export function useRequestHeaders(appContext: AppContext | undefined, headersToProxy: Array<string> = []): Readonly<Headers> {
    if (!DEFINE.IS_SSR) {
        return {}
    }

    const headers = appContext?.req.headers ?? {}
    if (headersToProxy.length === 0) {
        return headers as Headers
    }

    const filteredHeaders: Headers = {}
    for (const key of headersToProxy) {
        const val = headers[key]
        if (val === undefined) {
            continue
        }

        filteredHeaders[key] = val as string
    }

    return filteredHeaders
}
