import express, { Response } from 'express'
import createHttpError from 'http-errors'

import { UserResponse, SuccessResponse } from '@api/interfaces/Responses'
import { enforceUserIsLoggedIn, logout } from '@api/middleware/user'

// ----------------------------------------------------------------------------
// Router
// ----------------------------------------------------------------------------

const settingsRouter = express.Router()
export default settingsRouter

settingsRouter.use(enforceUserIsLoggedIn)

// ----------------------------------------------------------------------------
// Get User Info
// ----------------------------------------------------------------------------

settingsRouter.get('/user', (req, res: Response, next) => {
    if (!res.locals.currentUser) {
        return next(new createHttpError.Forbidden())
    }

    const user = res.locals.currentUser
    const settings: UserResponse = {
        malUserId: user.malUserId,
        malUsername: user.malUsername,
        lastChecked: user.lastChecked,
    }

    return res.status(200).json(settings)
})

// ----------------------------------------------------------------------------
// Delete User
// ----------------------------------------------------------------------------

settingsRouter.delete('/user', (req, res: Response, next) => {
    void (async() => {
        try {
            const user = res.locals.currentUser
            if (!user) {
                return next(new createHttpError.Forbidden())
            }

            await user.destroy()
            await logout(req, res)

            const success: SuccessResponse = { message: 'Your MyAnimeList.net account has been deleted from this website' }
            return res.status(200).json(success)
        } catch (err) {
            return next(new createHttpError.InternalServerError('Failed to delete user'))
        }
    })()
})
