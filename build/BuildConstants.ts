import path from 'node:path'
import { getBuildSecret, BuildSecret, getGitHash } from './BuildSecret'

// Assume we are running webpack from the project root (../)
const rootDir = path.resolve()

export const isDev = (process.env.NODE_ENV === 'development')
export const gitHash = getGitHash(rootDir)
export const manifestFileName = 'ssr-manifest.json'
export const entryFile = 'app.html'
export const rawDirRegexp = /\/raw\//

export const publicPathOnServer = '/public/'
export const publicPath = isDev
    ? getBuildSecret(BuildSecret.WEB_URL) + publicPathOnServer
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

    'DEFINE.IS_DEV': JSON.stringify(isDev),
    'DEFINE.IS_SSR': "(typeof window === 'undefined')",
    'DEFINE.GIT_HASH': JSON.stringify(gitHash),

    'DEFINE.WEB_URL': JSON.stringify(getBuildSecret(BuildSecret.WEB_URL)),
    'DEFINE.WEB_PORT': JSON.stringify(getBuildSecret(BuildSecret.WEB_PORT)),
    'DEFINE.API_URL': JSON.stringify(getBuildSecret(BuildSecret.API_URL)),
    'DEFINE.API_PORT': JSON.stringify(getBuildSecret(BuildSecret.API_PORT)),

    'DEFINE.SSR_PUBLIC_PATH': JSON.stringify('/'),
    'DEFINE.SSR_PUBLIC_DIR': JSON.stringify(distClientDir),
    'DEFINE.SSR_MANIFEST_FILE': JSON.stringify(distServerManifest),
    'DEFINE.SSR_HTML_TEMPLATE': JSON.stringify(distServerTemplate),
}
