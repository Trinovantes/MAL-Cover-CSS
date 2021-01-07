import { RequestHandler } from 'express'

import { createLogger } from '@common/utils/logger'

const logger = createLogger('dev middleware')
const HEADER_LEN = 40

export const debugInfo: RequestHandler = (req, res, next) => {
    if (DEFINE.IS_DEV) {
        logger.debug('='.repeat(HEADER_LEN))
        logger.debug('[middleware] debugInfo')
        logger.debug('='.repeat(HEADER_LEN))
        logger.debug('URL:%s', req.url)
        console.debug('req.session =', req.session)
        console.debug('req.query   =', req.query)
        console.debug('res.locals  =', res.locals)
        logger.debug('-'.repeat(HEADER_LEN))
    }

    next()
}
