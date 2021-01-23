import { RequestHandler, Request, Response } from 'express'
import createHttpError from 'http-errors'

import { User } from '@common/models/User'
import { createLogger } from '@common/utils/logger'

const logger = createLogger('user middleware')

export const setUserInLocals: RequestHandler = (req, res, next) => {
    void (async() => {
        try {
            logger.verbose('Running setUserInLocals')
            if (!req.session.currentUser) {
                logger.verbose('No user set in session')
                return next()
            }

            const malUserId = req.session.currentUser.malUserId
            const user = await User.findOne({
                where: {
                    malUserId: malUserId,
                },
            })

            if (user) {
                logger.verbose('Found %d, setting %s in locals', malUserId, user.malUsername)
                res.locals.currentUser = user
            } else {
                logger.verbose('Did not find user %d', malUserId)
                await logout(req, res)
            }

            return next()
        } catch (err) {
            const error = err as Error
            logger.warn('setUserInLocals Failed user:%d (%s:%s)', req.session.currentUser?.malUserId, error.name, error.message)
            logger.debug(error.stack)
            return next(new createHttpError.InternalServerError('setUserInLocals Failed'))
        }
    })()
}

export const enforceUserIsLoggedIn: RequestHandler = (req, res, next) => {
    logger.verbose('Running enforceUserIsLoggedIn')

    if (res.locals.currentUser) {
        return next()
    } else {
        return next(new createHttpError.Forbidden('This API endpoint requires logging in first'))
    }
}

export async function logout(req: Request, res: Response): Promise<void> {
    logger.verbose('Logging user out')

    await new Promise<void>((resolve) => {
        req.session.destroy(() => {
            resolve()
        })
    })

    res.locals = {}
}
