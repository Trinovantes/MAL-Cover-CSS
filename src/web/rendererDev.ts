import webpack from 'webpack'
import WebpackDevMiddleware from 'webpack-dev-middleware'
import WebpackHotMiddleware from 'webpack-hot-middleware'
import MemoryFileSystem from 'memory-fs'
import { createBundleRenderer } from 'vue-server-renderer'

import clientConfig from '@build/webpack.config.web.client'
import serverConfig from '@build/webpack.config.web.server'
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
// Dev Middleware
// ----------------------------------------------------------------------------

export const setupDevMiddleware: RendererSetup = (app, onRendererUpdate) => {
    return new Promise<void>((resolve, reject) => {
        // We are reading the bundle and manifest at runtime instead of importing them at
        // compile time is because they are not generated until after compile time
        let bundleString: string
        let manifestString: string

        const updateRenderer = () => {
            if (!bundleString || !manifestString) {
                return
            }

            const serverBundle = Object.assign({}, JSON.parse(bundleString) as unknown)
            const clientManifest = Object.assign({}, JSON.parse(manifestString) as unknown)
            const renderer = createBundleRenderer(serverBundle, {
                runInNewContext: false,
                template: template,
                basedir: clientDir,
                clientManifest: clientManifest,
            })

            onRendererUpdate(renderer)
            resolve()
        }

        const memoryFs = new MemoryFileSystem()

        // Watch for entryClient changes
        {
            const clientCompiler = webpack(clientConfig)
            clientCompiler.hooks.done.tap('SSR updateRenderer', (stats) => {
                if (stats.hasErrors()) {
                    return reject(new Error('Failed to compile client'))
                }

                manifestString = memoryFs.readFileSync(`${clientDir}/vue-ssr-client-manifest.json`, 'utf-8') as string
                updateRenderer()
            })

            const devMiddleware = WebpackDevMiddleware(clientCompiler, {
                fs: memoryFs,
                publicPath: publicPath,
            })
            const hotMiddleware = WebpackHotMiddleware(clientCompiler, {
                heartbeat: 5000,
            })

            app.use(devMiddleware)
            app.use(hotMiddleware)
        }

        // Watch for entryServer changes
        {
            const serverCompiler = webpack(serverConfig)
            serverCompiler.outputFileSystem = memoryFs
            serverCompiler.watch({}, (error) => {
                if (error) {
                    return reject(new Error('Failed to compile server'))
                }

                bundleString = memoryFs.readFileSync(`${serverDir}/vue-ssr-server-bundle.json`, 'utf-8') as string
                updateRenderer()
            })
        }
    })
}
