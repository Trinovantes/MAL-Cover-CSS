import path from 'path'
import { merge } from 'webpack-merge'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import { staticDir, srcWebDir, publicPath, distWebPublicDir, distWebDir, commonWebConfig, entryFileName, manifestFilePath } from './webpack.common'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { createOutputNameFn } from './utils/createOutputNameFn'
import 'webpack-dev-server'
import { VueSsrAssetsClientPlugin } from 'vue-ssr-assets-plugin'

// ----------------------------------------------------------------------------
// Client
// ----------------------------------------------------------------------------

export default merge(commonWebConfig, {
    target: 'web',

    entry: {
        main: path.resolve(srcWebDir, 'entryClient.ts'),
    },

    output: {
        path: distWebPublicDir,
        publicPath,
        filename: createOutputNameFn('js', true),
        chunkFilename: createOutputNameFn('js', false),
    },

    devServer: {
        host: 'test.malcovercss.link',
        port: 9040,
        devMiddleware: {
            index: entryFileName,
            writeToDisk: (filePath) => {
                // Since output.publicPath is '/public', app.html can only be accessed at /public/index.html
                // Instead, we need to write it to disk and have webpack-dev-server serve it from '/' (contentBasePublicPath)
                if (filePath.endsWith('.html')) {
                    return true
                }

                // Emit ssr-manifest.json for debugging
                if (filePath.endsWith('.json')) {
                    return true
                }

                return false
            },
        },
        historyApiFallback: {
            index: entryFileName,
        },
        static: [
            {
                directory: distWebDir,
                publicPath: '/',
            },
            {
                directory: staticDir,
                publicPath: '/',
            },
        ],
        proxy: {
            '/api': 'http://localhost:3000',
        },
    },

    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: staticDir,
                    to: distWebDir,
                },
            ],
        }),
        new MiniCssExtractPlugin({
            filename: createOutputNameFn('css', true),
            chunkFilename: createOutputNameFn('css', false),
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(srcWebDir, 'index.html'),
            filename: path.resolve(distWebDir, 'app.html'),
        }),
        new VueSsrAssetsClientPlugin({
            fileName: manifestFilePath,
        }),
    ],
})
