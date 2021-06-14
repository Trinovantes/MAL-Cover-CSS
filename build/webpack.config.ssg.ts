import path from 'path'
import { merge } from 'webpack-merge'
import { commonConfig, srcWebDir, publicPath, manifestFilePath, distWebPublicDir, distWebDir, distSsgDir, rawDirRegexp } from './webpack.common'
import { PuppeteerPrerenderPlugin } from 'puppeteer-prerender-plugin'
import { DefinePlugin } from 'webpack'
import nodeExternals from 'webpack-node-externals'

// ----------------------------------------------------------------------------
// Server
// ----------------------------------------------------------------------------

export default merge(commonConfig, {
    target: 'node',

    entry: {
        www: `${srcWebDir}/entryServer.ts`,
    },

    output: {
        path: distSsgDir,

        // This tells the server bundle to use Node-style exports
        libraryTarget: 'commonjs2',
    },

    module: {
        rules: [
            {
                // Do not inject css in the server bundle
                test: /\.(css|sass|scss)$/,
                use: 'null-loader',
                exclude: rawDirRegexp,
            },
            {
                // Do not inject fonts in the server bundle
                test: /\.(ttf|eot|woff(2)?)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: 'null-loader',
            },
            {
                test: /\.(jpe?g|png|gif|svg|webp)$/i,
                use: [
                    {
                        loader: 'responsive-loader',
                        options: {
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                            adapter: require('responsive-loader/sharp'),
                            format: 'webp',
                            publicPath: publicPath,
                            emitFile: false,
                        },
                    },
                ],
            },
        ],
    },

    externals: [
        // Do not externalize dependencies that need to be processed by webpack.
        // You should also whitelist deps that modify `global` (e.g. polyfills)
        nodeExternals({
            allowlist: [
                /^vue*/,
                /\.(css|sass|scss)$/,
                /\.(vue)$/,
                /\.(html)$/,
            ],
        }),
    ],

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
            entryDir: distWebDir,
            entryFile: path.resolve(distSsgDir, 'www.js'),
            routes: [
                '/guide',
                '/example',
                '/classic-vs-modern',
                '/settings',
                '/',
            ],
            postProcess(result) {
                result.html = result.html.replace(
                    '<link rel="icon" type="image/ico" href="/favicon.ico">',
                    '<link rel="icon" type="image/png" href="/favicon.png">')
            },
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
