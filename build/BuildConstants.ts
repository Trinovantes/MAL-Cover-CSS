import path from 'node:path'
import { getBuildSecret, getGitHash } from './BuildSecret.ts'

// Assume we are running webpack from the project root (../)
const rootDir = path.resolve()

export const isDev = (process.env.NODE_ENV === 'development')
export const gitHash = getGitHash(rootDir)
export const manifestFileName = 'ssr-manifest.json'
export const entryFile = 'app.html'
export const rawDirRegexp = /\/raw\//

export const publicPathOnServer = '/public/'
export const publicPath = isDev
    ? getBuildSecret('WEB_URL') + publicPathOnServer
    : publicPathOnServer

export const srcDir = path.join(rootDir, 'src')
export const srcCronDir = path.join(srcDir, 'cron')
export const srcWebDir = path.join(srcDir, 'web')
export const srcWebTemplate = path.join(srcDir, 'web', 'index.html')
export const srcWebStaticDir = path.join(srcDir, 'web', 'static')

export const distDir = path.join(rootDir, 'dist')
export const distCronDir = path.join(distDir, 'cron')
export const distWebDir = path.join(distDir, 'web')

export const distClientDir = path.join(distWebDir, 'client')
export const distServerDir = path.join(distWebDir, 'server')
export const distServerManifest = path.join(distServerDir, manifestFileName)
export const distServerTemplate = path.join(distServerDir, 'index.html')

export const buildConstants = {
    __VUE_OPTIONS_API__: JSON.stringify(false),
    __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),

    __IS_DEV__: JSON.stringify(isDev),
    __IS_SSR__: "(typeof window === 'undefined')",
    __GIT_HASH__: JSON.stringify(gitHash),

    __WEB_URL__: JSON.stringify(getBuildSecret('WEB_URL')),
    __WEB_PORT__: JSON.stringify(getBuildSecret('WEB_PORT')),
    __API_URL__: JSON.stringify(getBuildSecret('API_URL')),
    __API_PORT__: JSON.stringify(getBuildSecret('API_PORT')),

    __SSR_PUBLIC_PATH__: JSON.stringify('/'),
    __SSR_PUBLIC_DIR__: JSON.stringify(distClientDir),
    __SSR_MANIFEST_FILE__: JSON.stringify(distServerManifest),
    __SSR_HTML_TEMPLATE__: JSON.stringify(distServerTemplate),
}
