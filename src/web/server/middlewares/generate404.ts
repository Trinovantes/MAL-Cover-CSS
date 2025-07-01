import type { RequestHandler, Request, Response, NextFunction } from 'express'
import createHttpError from 'http-errors'

export function generate404(): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
        next(new createHttpError.NotFound('No routes matched'))
    }
}
