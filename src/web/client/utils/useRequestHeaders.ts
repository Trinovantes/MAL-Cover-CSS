import { useAppContext } from '@/web/AppContext'

type Headers = Record<string, string>

export function useRequestHeaders(headersToProxy: Array<string> = []): Readonly<Headers> {
    if (!DEFINE.IS_SSR) {
        return {}
    }

    const headers = useAppContext()?.req.headers ?? {}
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
