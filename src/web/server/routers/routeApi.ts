import express from 'express'
import { ServerAppContext } from '../ServerAppContext'
import { setUser } from '../middlewares/setUser'
import { routeOauth } from './api/routeOauth'
import { routeSettings } from './api/routeSettings'

export function routeApi(ctx: ServerAppContext) {
    const router = express.Router()
    router.use(setUser(ctx))

    router.use('/oauth', routeOauth(ctx))
    router.use('/settings', routeSettings(ctx))

    return router
}
