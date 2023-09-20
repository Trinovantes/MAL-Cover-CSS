import express, { Response } from 'express'
import { clearSession } from '@/web/server/utils/clearSession'
import { createAsyncHandler } from '@/web/server/utils/createAsyncHandler'
import { APP_NAME } from '@/common/Constants'
import { SuccessResponse, UserResponse } from '@/web/server/interfaces/ApiResponse'
import { enforceAuth } from '@/web/server/middlewares/enforceAuth'
import { ServerAppContext } from '@/web/server/ServerAppContext'
import createHttpError from 'http-errors'
import { deleteUser, stringifyUser } from '@/common/db/models/User'

export function routeSettings({ db }: ServerAppContext) {
    const router = express.Router()
    router.use(enforceAuth())

    router.get('/user', (req, res: Response, next) => {
        const user = res.locals.currentUser
        if (!user) {
            next(createHttpError.BadRequest())
            return
        }

        res.json(user satisfies UserResponse)
    })

    router.delete('/user', createAsyncHandler(async(req, res, next) => {
        const user = res.locals.currentUser
        if (!user) {
            next(createHttpError.BadRequest())
            return
        }

        res.log.info(`Deleting ${stringifyUser(user)}`)
        deleteUser(db, user.malUserId)
        await clearSession(req, res)
        res.json({ message: `Your MyAnimeList account information has been removed from ${APP_NAME}` } satisfies SuccessResponse)
    }))

    return router
}
