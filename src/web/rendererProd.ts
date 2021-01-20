import fs from 'fs'
import { createBundleRenderer } from 'vue-server-renderer'

import template from '@views/index.html'

// ----------------------------------------------------------------------------
// ENV
// ----------------------------------------------------------------------------

const publicPath = DEFINE.PUBLIC_PATH
const staticDir = DEFINE.STATIC_DIR
const serverDir = DEFINE.SERVER_DIR
const clientDir = DEFINE.CLIENT_DIR

if (!publicPath || !serverDir || !clientDir || !staticDir) {
    throw new Error('Missing DEFINES')
}

// ----------------------------------------------------------------------------
// Prod Middleware
// ----------------------------------------------------------------------------

export const setupProdMiddleware: RendererSetup = (app, onRendererUpdate) => {
    return new Promise((resolve) => {
        const serverBundle = Object.assign({}, JSON.parse(fs.readFileSync(`${serverDir}/vue-ssr-server-bundle.json`, 'utf-8')) as unknown)
        const clientManifest = Object.assign({}, JSON.parse(fs.readFileSync(`${clientDir}/vue-ssr-client-manifest.json`, 'utf-8')) as unknown)

        const renderer = createBundleRenderer(serverBundle, {
            runInNewContext: false,
            template: template,
            basedir: clientDir,
            clientManifest: clientManifest,
        })

        onRendererUpdate(renderer)
        resolve()
    })
}
