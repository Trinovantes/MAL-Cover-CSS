import express from 'express'

export async function clearSession(req: express.Request, res: express.Response): Promise<void> {
    res.locals = {}

    await new Promise<void>((resolve, reject) => {
        req.session.destroy((err) => {
            if (err === undefined || err === null) {
                resolve()
            } else if (err instanceof Error) {
                reject(err)
            } else {
                reject(new Error(`Failed to clear session err:${String(err)}`))
            }
        })
    })
}
