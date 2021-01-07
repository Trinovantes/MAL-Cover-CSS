import Constants from '@common/Constants'
import { AxiosError } from 'axios'

export function normalizePort(val: string): string | number | null {
    const port = parseInt(val, 10)

    if (isNaN(port)) {
        // Named pipe
        return val
    }

    if (port >= 0) {
        // Port number
        return port
    }

    return null
}

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

type FieldTypes = 'string' | 'boolean' | 'number' | 'object'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function hasExpectedNumFields(obj: any | undefined, minFields: number, maxFields: number = minFields): boolean {
    if (typeof obj !== 'object' || !obj) {
        return false
    }

    const numKeys = Object.keys(obj).length
    return numKeys >= minFields && numKeys <= maxFields
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function hasField(obj: any | undefined, field: string, fieldType: FieldTypes, isOptional = false): boolean {
    if (typeof obj !== 'object' || !obj) {
        return false
    }

    if (isOptional) {
        // Either does not have the optional property or has the property and must match the expected type
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return !Object.prototype.hasOwnProperty.call(obj, field) || typeof obj[field] === fieldType
    } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return Object.prototype.hasOwnProperty.call(obj, field) && typeof obj[field] === fieldType
    }
}

export function isAxiosError(err: unknown): err is AxiosError {
    return (err as AxiosError).isAxiosError !== undefined
}

export function getHost(): string {
    if (Constants.IS_SSR) {
        if (!process.env.API_HOST) {
            throw new Error('API_HOST is not defined in env')
        }

        return process.env.API_HOST
    } else {
        return window.location.origin
    }
}
