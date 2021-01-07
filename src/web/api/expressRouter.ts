import express, { ErrorRequestHandler } from 'express'
import createHttpError, { HttpError } from 'http-errors'

import oauthRouter from './oauth'
import settingsRouter from './settings'
import { ErrorResponse } from './interfaces/Responses'

// ----------------------------------------------------------------------------
// Router
// ----------------------------------------------------------------------------

const apiRouter = express.Router()
export { apiRouter }

// ----------------------------------------------------------------------------
// Routes
// ----------------------------------------------------------------------------

apiRouter.use('/oauth', oauthRouter)
apiRouter.use('/settings', settingsRouter)

// ----------------------------------------------------------------------------
// No routes matched by apiRouter so we'll create a 404 json response
// ----------------------------------------------------------------------------

apiRouter.use('*', (req, res, next) => {
    next(new createHttpError.NotFound())
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHander: ErrorRequestHandler = (err, req, res, next) => {
    const error = err as Error | HttpError

    // Set locals, only providing error in development
    const status = error instanceof HttpError ? error.status : 500
    const message = error instanceof HttpError ? error.message : 'Internal Server Error'

    const response: ErrorResponse = {
        errorMessage: message,
    }

    return res.status(status).json(response)
}

apiRouter.use(errorHander)
