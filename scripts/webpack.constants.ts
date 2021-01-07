import path from 'path'

export const isDev = (process.env.NODE_ENV === 'development')
export const publicPath = '/public/'

const rootDir = path.resolve() // Assume we are running from the project root

export const scriptsDir = path.resolve(rootDir, 'scripts')
export const staticDir = path.resolve(rootDir, 'static')

export const distCronDir = path.resolve(rootDir, 'dist-cron')
export const distClientDir = path.resolve(rootDir, 'dist-web-client')
export const distServerDir = path.resolve(rootDir, 'dist-web-server')

export const srcDir = path.join(rootDir, 'src')
export const srcCronDir = path.resolve(srcDir, 'cron')
export const srcWebDir = path.resolve(srcDir, 'web')
