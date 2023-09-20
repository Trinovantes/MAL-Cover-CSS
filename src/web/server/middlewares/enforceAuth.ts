import { RequestHandler, Request, Response, NextFunction } from 'express'
import createHttpError from 'http-errors'

export function enforceAuth(): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = res.locals.currentUser
        if (!user) {
            next(new createHttpError.Forbidden())
            return
        }

        next()
    }
}
