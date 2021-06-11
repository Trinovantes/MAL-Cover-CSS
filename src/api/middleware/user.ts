import { RequestHandler, Request, Response, NextFunction } from 'express'
import createHttpError from 'http-errors'
import { User } from '@/common/models/User'
import { createAsyncHandler } from '@/api/utils/asyncHandler'

export const setUserInLocals = createAsyncHandler(async(req, res, next) => {
    const malUserId = req.session.currentUser?.malUserId
    console.info('[middleware]', 'setUserInLocals', malUserId)
    if (malUserId === undefined) {
        return next()
    }

    const user = await User.fetch(malUserId)
    if (user) {
        console.info(`Found ${user.toString()}, setting in locals`)
        res.locals.currentUser = user
    } else {
        console.info(`Did not find user ${malUserId}`)
        await clearSession(req, res)
    }

    return next()
})

export const enforceUserIsLoggedIn: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    console.info('[middleware]', 'enforceUserIsLoggedIn')

    if (res.locals.currentUser) {
        return next()
    } else {
        return next(new createHttpError.Forbidden('This endpoint requires you to be logged in'))
    }
}

export async function clearSession(req: Request, res: Response): Promise<void> {
    console.info('Clearing session')

    await new Promise<void>((resolve, reject) => {
        req.session.destroy((err) => {
            if (err === undefined || err === null) {
                resolve()
            } else {
                reject(err)
            }
        })
    })

    res.locals = {}
}
