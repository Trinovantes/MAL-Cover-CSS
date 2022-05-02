// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SessionData } from 'express-session'

import { ErrorResponse, UserResponse } from '@/web/server/schemas/ApiResponse'
import { OauthState } from '@/web/server/schemas/OauthState'

declare module 'express-session' {
    interface SessionData {
        oauthState: OauthState | undefined
        currentUser: UserResponse | undefined
        pendingError: ErrorResponse | undefined
    }
}
