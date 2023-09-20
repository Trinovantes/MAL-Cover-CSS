import { formatDistance } from 'date-fns'

export function getRelativeTime(date?: Date | string | null): string {
    if (date === null || date === undefined) {
        return ''
    }
    if (typeof date === 'string') {
        date = new Date(date)
    }

    return formatDistance(date, new Date(), { addSuffix: true })
}
