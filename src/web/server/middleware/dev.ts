import type { RequestHandler } from 'express'

export const debugInfo: RequestHandler = (req, res, next) => {
    if (DEFINE.IS_DEV) {
        const TAG = '[middleware::debugInfo]'
        console.debug('='.repeat(80))
        console.debug(TAG, 'req.method       =', req.method)
        console.debug(TAG, 'req.originalUrl  =', req.originalUrl)
        console.debug(TAG, 'req.session      =', req.session)
    }

    next()
}
