// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Response } from 'express'
import { selectUser } from '@/common/db/models/User'

declare module 'express' {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Response {
        locals: {
            currentUser?: ReturnType<typeof selectUser>
        }
    }
}
