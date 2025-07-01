// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { SessionData } from 'express-session'
import type { OauthState } from '../web/server/interfaces/OauthState.ts'

declare module 'express-session' {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface SessionData {
        oauthState?: OauthState
        malUserId?: number
    }
}
