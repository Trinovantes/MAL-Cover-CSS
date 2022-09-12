// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SessionData } from 'express-session'

import { ErrorResponse, UserResponse } from '@/web/server/schemas/ApiResponse'
import { OauthState } from '@/web/server/schemas/OauthState'

declare module 'express-session' {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface SessionData {
        oauthState: OauthState
        currentUser: UserResponse
        pendingError: ErrorResponse
    }
}
