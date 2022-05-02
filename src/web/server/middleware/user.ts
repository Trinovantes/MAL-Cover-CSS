import createHttpError from 'http-errors'
import { clearSession } from '../utils/clearSession'
import { createAsyncHandler } from '../utils/createAsyncHandler'
import { User } from '@/common/models/User'
import type { RequestHandler, Request, Response, NextFunction } from 'express'

export const setUserInLocals = createAsyncHandler(async(req, res, next) => {
    const TAG = '[middleware::setUserInLocals]'

    const malUserId = req.session.currentUser?.malUserId
    console.info(TAG, malUserId)
    if (malUserId === undefined) {
        return next()
    }

    const user = await User.fetch(malUserId)
    if (user) {
        console.info(TAG, `Found ${user.toString()}, setting res.locals.currentUser`)
        res.locals.currentUser = user
    } else {
        console.info(TAG, `Did not find user ${malUserId}`)
        await clearSession(req, res)
    }

    return next()
})

export const enforceUserIsLoggedIn: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const TAG = '[middleware::enforceUserIsLoggedIn]'
    console.info(TAG, Boolean(res.locals.currentUser))

    if (res.locals.currentUser) {
        return next()
    } else {
        return next(new createHttpError.Forbidden('This endpoint requires you to be logged in'))
    }
}
