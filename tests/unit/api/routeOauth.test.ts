import { describe, expect } from 'vitest'
import { apiTest } from '../fixtures/apiTest'
import { LoginPayload } from '@/web/server/interfaces/LoginPayload'

describe('/login', () => {
    apiTest('missing body should 400', async({ api }) => {
        const res = await api.post('/api/oauth/login')
        expect(res.status).toBe(400)
    })

    apiTest('invalid body should 400', async({ api }) => {
        const body = { invalidBody: true }
        const res = await api.post('/api/oauth/login', body)
        expect(res.status).toBe(400)
    })

    apiTest('valid body with extra fields should 400', async({ api }) => {
        const body = { restorePath: '/', extraField: true }
        const res = await api.post('/api/oauth/login', body)
        expect(res.status).toBe(400)
    })

    apiTest('valid body should 200', async({ api }) => {
        const body = { restorePath: '/' } satisfies LoginPayload
        const res = await api.post('/api/oauth/login', body)
        expect(res.status).toBe(200)
    })
})

describe('/logout', () => {
    apiTest('logged out user should get 403', async({ api }) => {
        const res = await api.post('/api/oauth/logout')
        expect(res.status).toBe(403)
    })
})

describe('/', () => {
    apiTest('logged out user should get redirected back home', async({ api }) => {
        const res = await api.get('/api/oauth')
        expect(res.status).toBe(302)
        expect((res.header as Record<string, string>).location).toBe('/')
    })
})
