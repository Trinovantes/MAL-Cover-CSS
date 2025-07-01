import express from 'express'
import type { ServerAppContext } from '../ServerAppContext.ts'
import { setUser } from '../middlewares/setUser.ts'
import { routeOauth } from './api/routeOauth.ts'
import { routeSettings } from './api/routeSettings.ts'

export function routeApi(ctx: ServerAppContext) {
    const router = express.Router()
    router.use(setUser(ctx))

    router.use('/oauth', routeOauth(ctx))
    router.use('/settings', routeSettings(ctx))

    return router
}
