import type { AppContext } from '../../AppContext.ts'
import type { ErrorResponse } from '../../server/interfaces/ApiResponse.ts'

type FetchResult<T> = {
    error: ErrorResponse
    data: null
} | {
    error: null
    data: T
}

/**
 * Can be called on both the client and server
 *  - If called on client, then this simply makes a normal fetch call
 *  - If called on server (initial ssr req), then this proxies the client's cookie to the ssr server to the API server and back
 *
 * https://nuxt.com/docs/getting-started/data-fetching#passing-headers-and-cookies
 */
export async function fetchWithSsrProxy<T>(url: string, config: RequestInit = { method: 'GET' }, appContext?: AppContext): Promise<FetchResult<T>> {
    const clientCookie = appContext?.req.headers.cookie
    const res = await fetch(__API_URL__ + url, {
        ...config,
        credentials: 'include',
        headers: {
            ...config?.headers,
            ...((clientCookie !== undefined)
                ? { Cookie: clientCookie }
                : {}
            ),
        },
    })

    if (appContext) {
        appContext.ssrProxyCookies = res.headers.get('set-cookie')
    }

    const text = await res.text()
    const json = text.length > 0
        ? JSON.parse(text) as unknown
        : {}

    if (res.status === 200) {
        return {
            error: null,
            data: json as T,
        }
    } else {
        return {
            error: json as ErrorResponse,
            data: null,
        }
    }
}
