// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Response } from 'express'

import { User } from '@common/models/User'

declare module 'express' {
    interface Response {
        locals: {
            currentUser?: User
        }
    }
}
