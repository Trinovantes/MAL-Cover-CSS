import * as Sentry from '@sentry/node'
import axios from 'axios'
import { HttpError } from 'http-errors'
import type { ErrorResponse } from '@/web/server/schemas/ApiResponse'
import type express from 'express'

export function setupRouterErrorHandler(router: express.Router, isJsonResponse: boolean): express.Router {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const errorHander: express.ErrorRequestHandler = (err, req, res, next) => {
        if (axios.isAxiosError(err)) {
            // Don't log entire Axios err object since it includes req, res
            console.info(err.name, err.message)
        } else if (!(err instanceof HttpError)) {
            // Log unexpected non-HttpErrors
            console.info(err)
        }

        let errorMessage: string
        if (DEFINE.IS_DEV && (err instanceof HttpError || err instanceof Error || axios.isAxiosError(err))) {
            errorMessage = err.stack ?? err.message
        } else {
            errorMessage = 'Internal Server Error'
        }

        const status = err instanceof HttpError ? err.status : 500
        res.status(status)

        if (isJsonResponse) {
            const response: ErrorResponse = { errorMessage }
            res.json(response)
        } else {
            res.send(`<pre>${errorMessage}</pre>`)
        }
    }

    router.use(Sentry.Handlers.errorHandler())
    router.use(errorHander)

    return router
}
