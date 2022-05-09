import { exec } from 'child_process'

export async function asyncExec(cmd: string): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(error)
            }

            resolve({ stdout, stderr })
        })
    })
}
