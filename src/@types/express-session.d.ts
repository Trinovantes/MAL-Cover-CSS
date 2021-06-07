// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SessionData } from 'express-session'

import { ErrorResponse, UserResponse } from '@/common/schemas/ApiResponse'
import { OauthState } from '@/common/schemas/OauthState'

declare module 'express-session' {
    interface SessionData {
        oauthState: OauthState | undefined
        currentUser: UserResponse | undefined
        pendingError: ErrorResponse | undefined
    }
}
