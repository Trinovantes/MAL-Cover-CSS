import path from 'path'
import { merge } from 'webpack-merge'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import { commonConfig, isDev, staticDir, srcWebDir, distWebDir, rawDirRegexp } from './webpack.common'
import { PRERENDER_STATUS_KEY, PuppeteerPrerenderPlugin } from 'puppeteer-prerender-plugin'
import { DefinePlugin } from 'webpack'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { JSDOM } from 'jsdom'

// ----------------------------------------------------------------------------
// Web
// ----------------------------------------------------------------------------

export default merge(commonConfig, {
    target: 'web',

    entry: {
        main: path.resolve(srcWebDir, 'main.ts'),
    },

    output: {
        path: distWebDir,
        publicPath: '/',
        filename: isDev
            ? '[name].js'
            : '[name].[contenthash].js',
        chunkFilename: isDev
            ? '[name].js'
            : '[name].[contenthash].js',
    },

    devServer: {
        host: 'test.malcovercss.link',
        port: 9004,
        historyApiFallback: true,
        proxy: {
            '/api': 'http://localhost:3000',
        },
    },

    module: {
        rules: [
            {
                test: /\.(sass|scss)$/,
                use: [
                    isDev
                        ? 'style-loader'
                        : MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            additionalData: (content: string, loaderContext: { resourcePath: string }): string => {
                                return (loaderContext.resourcePath.endsWith('sass'))
                                    ? '@use "sass:math"\n @import "@/web/assets/css/variables.scss"\n' + content
                                    : '@use "sass:math";  @import "@/web/assets/css/variables.scss"; ' + content
                            },
                        },
                    },
                ],
            },
            {
                test: /\.(css)$/,
                exclude: rawDirRegexp,
                use: [
                    isDev
                        ? 'style-loader'
                        : MiniCssExtractPlugin.loader,
                    'css-loader',
                ],
            },
            {
                test: /\.(ttf|eot|woff(2)?)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                type: 'asset',
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
                        },
                    },
                ],
            },
        ],
    },

    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: staticDir,
                },
            ],
        }),
        new MiniCssExtractPlugin({
            filename: isDev
                ? '[name].css'
                : '[name].[contenthash].css',
            chunkFilename: isDev
                ? '[name].css'
                : '[name].[contenthash].css',
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(srcWebDir, 'index.html'),
        }),
        new DefinePlugin({
            'DEFINE.IS_PRERENDER': `window.${PRERENDER_STATUS_KEY}`,
            'DEFINE.PRERENDER_READY_EVENT': JSON.stringify('__RENDERED__'),
        }),
        new PuppeteerPrerenderPlugin({
            enabled: !isDev,
            renderAfterEvent: '__RENDERED__',
            outputDir: distWebDir,
            postProcess: (result) => {
                const dom = new JSDOM(result.html)
                const app = dom.window.document.querySelector('div#app')
                if (app) {
                    // Remove app HTML since Vue 3 cannot hydrate non-SSR markup
                    app.innerHTML = ''
                }

                result.html = dom.serialize()
            },
            routes: [
                '/guide',
                '/example',
                '/classic-vs-modern',
                '/settings',
                '/',
            ],
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
