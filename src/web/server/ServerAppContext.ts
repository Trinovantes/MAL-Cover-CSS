import session from 'express-session'
import type { HttpLogger } from 'pino-http'
import type { DrizzleClient } from '../../common/db/createDb.ts'

type Options = {
    trustProxy: boolean
    enableCors: boolean
    enableStaticFiles: boolean
    enableVue: boolean
}

export type ServerAppContext = Readonly<Options> & {
    db: DrizzleClient
    sessionStore: Required<session.SessionOptions>['store']
    httpLogger: HttpLogger
}
