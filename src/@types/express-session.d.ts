// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SessionData } from 'express-session'

import { ErrorResponse, UserResponse } from '@api/interfaces/Responses'
import { OauthState } from '@api/interfaces/Session'

declare module 'express-session' {
    interface SessionData {
        oauthState?: OauthState
        currentUser?: UserResponse
        error?: ErrorResponse
    }
}
