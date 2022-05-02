import assert from 'assert'
import express from 'express'
import { enforceUserIsLoggedIn } from '../middleware/user'
import { clearSession } from '../utils/clearSession'
import { createAsyncHandler } from '../utils/createAsyncHandler'
import { APP_NAME } from '@/common/Constants'
import type { SuccessResponse } from '@/web/server/schemas/ApiResponse'

// ----------------------------------------------------------------------------
// Router
// ----------------------------------------------------------------------------

export const settingsRouter = express.Router()
const userSettingsRouter = express.Router()

settingsRouter.use(enforceUserIsLoggedIn)
settingsRouter.use('/user', userSettingsRouter)

// ----------------------------------------------------------------------------
// User
// ----------------------------------------------------------------------------

userSettingsRouter.get('/', (req: express.Request, res: express.Response) => {
    assert(res.locals.currentUser)

    const user = res.locals.currentUser
    const userResponse = user.toResponseData()

    res.status(200)
    res.json(userResponse)
})

userSettingsRouter.delete('/', createAsyncHandler(async(req, res) => {
    assert(res.locals.currentUser)

    const user = res.locals.currentUser
    console.info(`Delete ${user.toString()}`)

    await user.destroy()
    await clearSession(req, res)

    const successResponse: SuccessResponse = {
        message: `Your MyAnimeList account information has been removed from ${APP_NAME}`,
    }

    res.status(200)
    res.json(successResponse)
}))
