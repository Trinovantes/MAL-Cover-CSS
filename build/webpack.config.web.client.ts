import CopyWebpackPlugin from 'copy-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { QuasarUnusedPlugin } from 'quasar-unused-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { VueSsrAssetsClientPlugin } from 'vue-ssr-assets-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import merge from 'webpack-merge'
import type { Configuration } from 'webpack'
import path from 'node:path'
import { commonWebConfig } from './webpack.common.ts'
import { distClientDir, distServerManifest, entryFile, isDev, manifestFileName, publicPath, publicPathOnServer, srcWebDir, srcWebStaticDir, srcWebTemplate } from './BuildConstants.ts'
import { getBuildSecret, isAnalyze } from './BuildSecret.ts'
import 'webpack-dev-server'

// ----------------------------------------------------------------------------
// Client
// ----------------------------------------------------------------------------

export default ((): Configuration => merge.default(commonWebConfig, {
    entry: {
        main: path.join(srcWebDir, 'entryClient.ts'),
    },

    output: {
        path: path.join(distClientDir, publicPathOnServer),

        filename: isDev
            ? '[name].js'
            : '[name].[contenthash].js',

        publicPath,
    },

    devServer: {
        allowedHosts: [new URL(getBuildSecret('WEB_URL')).hostname],
        port: getBuildSecret('WEB_PORT'),
        devMiddleware: {
            index: entryFile,
            writeToDisk: (filePath) => {
                // Since output.publicPath is '/public', app.html can only be accessed at /public/index.html
                // Instead, we need to write it to disk and have webpack-dev-server serve it from '/' (contentBasePublicPath)
                if (filePath.endsWith('.html')) {
                    return true
                }

                if (filePath.endsWith(manifestFileName)) {
                    return true
                }

                return false
            },
        },
        historyApiFallback: {
            index: entryFile,
        },
        static: [
            {
                directory: distClientDir,
                publicPath: '/',
            },
            {
                // CopyWebpackPlugin does not run during dev mode
                directory: srcWebStaticDir,
                publicPath: '/',
            },
        ],
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        proxy: [
            {
                context: ['/api'],
                target: getBuildSecret('API_URL'),
            },
        ],
    },

    plugins: [
        (isDev
            ? new HtmlWebpackPlugin({
                template: srcWebTemplate,
                filename: path.join(distClientDir, entryFile),
            })
            : null
        ),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: srcWebStaticDir,
                    to: distClientDir,
                },
            ],
        }),
        new MiniCssExtractPlugin({
            filename: isDev
                ? '[name].css'
                : '[name].[contenthash].css',
        }),
        new QuasarUnusedPlugin({
            enableSsr: true,
        }),
        new VueSsrAssetsClientPlugin({
            fileName: distServerManifest,
        }),
        new BundleAnalyzerPlugin({
            analyzerMode: isAnalyze()
                ? 'server'
                : 'disabled',
        }),
    ],
}))()
