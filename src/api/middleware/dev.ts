import { RequestHandler } from 'express'

export const debugInfo: RequestHandler = (req, res, next) => {
    if (DEFINE.IS_DEV) {
        console.debug('='.repeat(80))
        console.debug('[middleware]', 'debugInfo')
        console.debug('req.url     =', req.url)
        console.debug('req.session =', req.session)
        console.debug('req.query   =', req.query)
    }

    next()
}
