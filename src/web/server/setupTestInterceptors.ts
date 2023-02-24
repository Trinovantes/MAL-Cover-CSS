import { BatchInterceptor } from '@mswjs/interceptors'
import { ClientRequestInterceptor } from '@mswjs/interceptors/ClientRequest'
import { XMLHttpRequestInterceptor } from '@mswjs/interceptors/XMLHttpRequest'
import { FetchInterceptor } from '@mswjs/interceptors/fetch'
import { MAL_API_URL, MAL_TOKEN_URL } from '@/common/Constants'

export function setupTestInterceptors() {
    const interceptor = new BatchInterceptor({
        name: 'Test Interceptors',
        interceptors: [
            new ClientRequestInterceptor(),
            new XMLHttpRequestInterceptor(),
            new FetchInterceptor(),
        ],
    })

    const externalOrigins = [
        'https://myanimelist.net',
        'https://api.myanimelist.net',
    ]

    interceptor.on('request', (req) => {
        const url = new URL(req.url)
        const isExternalRequest = externalOrigins.includes(url.origin)
        if (!isExternalRequest) {
            return
        }

        if (url.toString() === MAL_TOKEN_URL) {
            req.respondWith(new Response(
                JSON.stringify({
                    access_token: 'test_mal_token',
                    refresh_token: 'test_mal_token',
                    expires_in: 15 * 60,
                    token_type: 'Bearer',
                }),
                {
                    status: 200,
                },
            ))
            return
        }

        if (url.toString() === `${MAL_API_URL}/users/@me`) {
            req.respondWith(new Response(
                JSON.stringify({
                    id: 0,
                    name: 'test_mal_user',
                    gender: '',
                    location: '',
                    joined_at: '',
                    picture: '',
                }),
                {
                    status: 200,
                },
            ))
            return
        }

        throw new Error(`Unhandled Node Intercepted Request: ${req.url.toString()}`)
    })

    interceptor.apply()
}
