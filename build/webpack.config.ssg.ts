import { merge } from 'webpack-merge'
import { srcWebDir, publicPath, manifestFilePath, distWebPublicDir, distSsgDir, distWebDir, commonNodeConfig, entryFilePath } from './webpack.common'
import { PuppeteerPrerenderPlugin } from 'puppeteer-prerender-plugin'
import { DefinePlugin } from 'webpack'
import path from 'path'
import { VueSsrAssetsServerPlugin } from 'vue-ssr-assets-plugin'

// ----------------------------------------------------------------------------
// Server
// ----------------------------------------------------------------------------

export default merge(commonNodeConfig, {
    entry: {
        www: `${srcWebDir}/entryServer.ts`,
    },

    output: {
        path: distSsgDir,
    },

    plugins: [
        new DefinePlugin({
            'DEFINE.ENTRY_FILE': JSON.stringify(path.relative(distWebPublicDir, entryFilePath)),
            'DEFINE.PUBLIC_DIR': JSON.stringify(distWebPublicDir),
            'DEFINE.PUBLIC_PATH': JSON.stringify(publicPath),
            'DEFINE.MANIFEST_FILE': JSON.stringify(manifestFilePath),
        }),
        new VueSsrAssetsServerPlugin(),
        new PuppeteerPrerenderPlugin({
            enabled: true,
            enablePageJs: false,
            entryDir: distSsgDir,
            entryFile: 'www.js',
            outputDir: distWebDir,
            routes: [
                '/',
            ],
            discoverNewRoutes: true,
            puppeteerOptions: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                ],
            },
        }),
    ],
})
