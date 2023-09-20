import { describe, expect } from 'vitest'
import { apiTest } from '../fixtures/apiTest'

describe('GET /user', () => {
    apiTest('logged out user should get 403', async({ api }) => {
        const res = await api.get('/api/settings/user')
        expect(res.status).toBe(403)
    })
})

describe('DELETE /user', () => {
    apiTest('logged out user should get 403', async({ api }) => {
        const res = await api.delete('/api/settings/user')
        expect(res.status).toBe(403)
    })
})
