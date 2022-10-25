import { BatchInterceptor } from '@mswjs/interceptors'
import nodeInterceptors from '@mswjs/interceptors/lib/presets/node'
import { MAL_API_URL, MAL_TOKEN_URL } from '@/common/Constants'

export function setupTestInterceptors() {
    const interceptor = new BatchInterceptor({
        name: 'Test Interceptors',
        interceptors: nodeInterceptors,
    })

    const externalOrigins = [
        'https://myanimelist.net',
        'https://api.myanimelist.net',
    ]

    interceptor.on('request', (req) => {
        const isExternalRequest = externalOrigins.includes(req.url.origin)
        if (!isExternalRequest) {
            return
        }

        if (req.url.toString() === MAL_TOKEN_URL) {
            req.respondWith({
                status: 200,
                body: JSON.stringify({
                    access_token: 'test_mal_token',
                    refresh_token: 'test_mal_token',
                    expires_in: 15 * 60,
                    token_type: 'Bearer',
                }),
            })
            return
        }

        if (req.url.toString() === `${MAL_API_URL}/users/@me`) {
            req.respondWith({
                status: 200,
                body: JSON.stringify({
                    id: 0,
                    name: 'test_mal_user',
                    gender: '',
                    location: '',
                    joined_at: '',
                    picture: '',
                }),
            })
            return
        }

        throw new Error(`Unhandled Node Intercepted Request: ${req.url.toString()}`)
    })

    interceptor.apply()
}
