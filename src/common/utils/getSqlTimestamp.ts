import { add } from 'date-fns'

export function isValidSqlTimestamp(timestamp: string): boolean {
    return /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/.test(timestamp)
}

export function getSqlTimestamp(now: Date = new Date()): string {
    return now.toISOString()
}

export function getSqlTimestampFromNow(offsetSec: number): string {
    return getSqlTimestamp(add(new Date(), { seconds: offsetSec }))
}
