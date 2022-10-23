import { test, expect } from '@playwright/test'

test.describe('/settings', () => {
    test.describe('/user', () => {
        test('[GET] logged out user should get 403', async({ request }) => {
            const res = await request.get('/api/settings/user')
            expect(res.status()).toBe(403)
        })

        test('[DELETE] logged out user should get 403', async({ request }) => {
            const res = await request.delete('/api/settings/user')
            expect(res.status()).toBe(403)
        })
    })
})
