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
