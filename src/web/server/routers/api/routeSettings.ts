import express, { type Response } from 'express'
import createHttpError from 'http-errors'
import type { ServerAppContext } from '../../ServerAppContext.ts'
import { enforceAuth } from '../../middlewares/enforceAuth.ts'
import { createAsyncHandler } from '../../utils/createAsyncHandler.ts'
import type { SuccessResponse, UserResponse } from '../../interfaces/ApiResponse.ts'
import { deleteUser, stringifyUser } from '../../../../common/db/models/User.ts'
import { clearSession } from '../../utils/clearSession.ts'
import { APP_NAME } from '../../../../common/Constants.ts'

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

    router.delete('/user', createAsyncHandler(async (req, res, next) => {
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
