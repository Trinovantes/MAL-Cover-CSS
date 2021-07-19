import { merge } from 'webpack-merge'
import { srcWebDir, publicPath, manifestFilePath, distWebPublicDir, distSsgDir, distWebDir, commonNodeConfig } from './webpack.common'
import { PuppeteerPrerenderPlugin } from 'puppeteer-prerender-plugin'
import { DefinePlugin } from 'webpack'

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
            'DEFINE.PUBLIC_DIR': JSON.stringify(distWebPublicDir),
            'DEFINE.PUBLIC_PATH': JSON.stringify(publicPath),
            'DEFINE.CLIENT_ENTRY_JS': JSON.stringify('main.js'),
            'DEFINE.CLIENT_ENTRY_CSS': JSON.stringify('main.css'),
            'DEFINE.MANIFEST_FILE': JSON.stringify(manifestFilePath),
        }),
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
