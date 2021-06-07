import express, { Response, Request, NextFunction } from 'express'
import createHttpError from 'http-errors'
import { clearSession, enforceUserIsLoggedIn } from '@/api/middleware/user'
import { SuccessResponse } from '@/common/schemas/ApiResponse'
import { APP_NAME } from '@/common/Constants'
import { createAsyncHandler } from '@/api/utils/asyncHandler'

// ----------------------------------------------------------------------------
// Router
// ----------------------------------------------------------------------------

export const settingsRouter = express.Router()

settingsRouter.use(enforceUserIsLoggedIn)

// ----------------------------------------------------------------------------
// Get User Info
// ----------------------------------------------------------------------------

settingsRouter.get('/user', (req: Request, res: Response, next: NextFunction) => {
    if (!res.locals.currentUser) {
        return next(new createHttpError.Forbidden())
    }

    const user = res.locals.currentUser
    const userResponse = user.toSessionData()

    res.status(200)
    res.json(userResponse)
})

// ----------------------------------------------------------------------------
// Delete User
// ----------------------------------------------------------------------------

settingsRouter.delete('/user', createAsyncHandler(async(req, res, next) => {
    const user = res.locals.currentUser
    if (!user) {
        return next(new createHttpError.Forbidden())
    }

    console.info(`Delete ${user.toString()}`)
    await user.destroy()
    await clearSession(req, res)

    const successResponse: SuccessResponse = {
        message: `Your MyAnimeList account information has been removed from ${APP_NAME}`,
    }

    res.status(200)
    res.json(successResponse)
}))
