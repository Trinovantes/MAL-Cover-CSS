import { selectUser } from '@/common/db/models/User'
import { ServerAppContext } from '../ServerAppContext'
import { clearSession } from '../utils/clearSession'
import { createAsyncHandler } from '../utils/createAsyncHandler'
import { RequestHandler } from 'express'

export function setUser({ db }: ServerAppContext): RequestHandler {
    return createAsyncHandler(async(req, res, next) => {
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
