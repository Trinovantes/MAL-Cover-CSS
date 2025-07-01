import { selectUser } from '../../../common/db/models/User.ts'
import type { ServerAppContext } from '../ServerAppContext.ts'
import { clearSession } from '../utils/clearSession.ts'
import { createAsyncHandler } from '../utils/createAsyncHandler.ts'
import type { RequestHandler } from 'express'

export function setUser({ db }: ServerAppContext): RequestHandler {
    return createAsyncHandler(async (req, res, next) => {
        const malUserId = req.session?.malUserId
        if (malUserId === undefined) {
            next()
            return
        }

        const user = selectUser(db, malUserId)
        if (!user) {
            // User in session but not in db (e.g. deleted user)
            await clearSession(req, res)
            next()
            return
        }

        res.locals.currentUser = user
        next()
    })
}
