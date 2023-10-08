import { DrizzleClient } from '@/common/db/createDb'
import session from 'express-session'
import { HttpLogger } from 'pino-http'

type Options = {
    trustProxy: boolean
    enableCors: boolean
    enableStaticFiles: boolean
    enableSentry: boolean
    enableVue: boolean
}

export type ServerAppContext = Readonly<Options> & {
    db: DrizzleClient
    sessionStore: Required<session.SessionOptions>['store']
    httpLogger: HttpLogger
}
