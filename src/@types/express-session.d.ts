// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SessionData } from 'express-session'
import { OauthState } from '@/web/server/interfaces/OauthState'

declare module 'express-session' {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface SessionData {
        oauthState?: OauthState
        malUserId?: number
    }
}
