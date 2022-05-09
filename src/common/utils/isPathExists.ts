import fs from 'fs/promises'

export async function isPathExists(path: string): Promise<boolean> {
    try {
        await fs.access(path)
        return true
    } catch (err) {
        return false
    }
}
