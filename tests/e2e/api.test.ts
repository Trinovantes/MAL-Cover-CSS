import { test, expect } from '@playwright/test'
import type { LoginRequest } from '@/web/server/schemas/LoginRequest'

test.describe('/api', () => {
    test.describe('/settings', () => {
        test('[GET] logged out user should get 403', async({ request }) => {
            const res = await request.get('/api/settings/user')
            expect(res.status()).toBe(403)
        })

        test('[DELETE] logged out user should get 403', async({ request }) => {
            const res = await request.delete('/api/settings/user')
            expect(res.status()).toBe(403)
        })
    })

    test.describe('/oauth', () => {
        test.describe('/login', () => {
            test('missing body should 400', async({ request }) => {
                const res = await request.post('/api/oauth/login')
                expect(res.status()).toBe(400)
            })

            test('invalid body should 400', async({ request }) => {
                const res = await request.post('/api/oauth/login', {
                    data: {
                        badBody: true,
                    },
                })
                expect(res.status()).toBe(400)
            })

            test('valid body should not be 400', async({ request }) => {
                const data: LoginRequest = { restorePath: '/' }
                const res = await request.post('/api/oauth/login', {
                    data,
                })
                expect(res.status()).not.toBe(400)
            })
        })

        test.describe('/logout', () => {
            test('logged out user should get 403', async({ request }) => {
                const res = await request.post('/api/oauth/logout')
                expect(res.status()).toBe(403)
            })
        })

        test.describe('/', () => {
            test('should always redirect back to home', async({ request }, testInfo) => {
                const res = await request.get('/api/oauth')
                expect(res.status()).toBe(200)
                expect(res.url()).toBe(`${testInfo.config.webServer?.url}/`)
            })
        })
    })
})
