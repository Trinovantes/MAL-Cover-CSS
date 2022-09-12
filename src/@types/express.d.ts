// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Response } from 'express'

import { User } from '@/common/models/User'

declare module 'express' {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Response {
        locals: {
            redirectUrl?: string
            currentUser?: User
        }
    }
}
