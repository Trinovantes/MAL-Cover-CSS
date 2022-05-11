function f(n: number): string {
    return n.toString().padStart(2, '0')
}

export function getSqlTimestamp(now: Date = new Date()): string {
    const YYYY = now.getFullYear()
    const MM = now.getMonth() + 1
    const DD = now.getDate()

    const hh = now.getHours()
    const mm = now.getMinutes()
    const ss = now.getSeconds()

    return `${YYYY}-${f(MM)}-${f(DD)} ${f(hh)}:${f(mm)}:${f(ss)}`
}

export function isValidSqlTimestamp(timestamp: string): boolean {
    return /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(timestamp)
}
