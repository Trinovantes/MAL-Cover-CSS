import type express from 'express'

export async function clearSession(req: express.Request, res: express.Response): Promise<void> {
    console.info('Clearing session')

    await new Promise<void>((resolve, reject) => {
        req.session.destroy((err) => {
            if (err === undefined || err === null) {
                resolve()
            } else {
                reject(err)
            }
        })
    })

    res.locals = {}
}
