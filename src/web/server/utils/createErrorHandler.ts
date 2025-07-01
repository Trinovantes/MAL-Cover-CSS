import type { ErrorRequestHandler } from 'express'
import { HttpError } from 'http-errors'
import type { ErrorResponse } from '../interfaces/ApiResponse.ts'

export function createErrorHandler(isJsonResponse: boolean): ErrorRequestHandler {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return (err, req, res, next) => {
        res.log.error(err)

        let errorMessage: string
        let status = 500

        if (err instanceof HttpError) {
            errorMessage = err.message
            status = err.status
        } else {
            errorMessage = 'Internal Server Error'
        }

        if (isJsonResponse) {
            res.status(status)
            res.json({ status, errorMessage } satisfies ErrorResponse)
        } else {
            res.status(status)
            res.send(`<pre>${errorMessage}</pre>`)
        }
    }
}
