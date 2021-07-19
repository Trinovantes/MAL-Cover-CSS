import path from 'path'
import { merge } from 'webpack-merge'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import { staticDir, srcWebDir, publicPath, manifestFilePath, distWebPublicDir, distWebDir, commonWebConfig } from './webpack.common'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { WebpackManifestPlugin } from 'webpack-manifest-plugin'
import { createOutputNameFn } from './createOutputNameFn'

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
        publicPath: publicPath,
        filename: createOutputNameFn('js', true),
        chunkFilename: createOutputNameFn('js', false),
    },

    optimization: {
        chunkIds: 'named',
        splitChunks: {
            chunks: 'all',
            minSize: 0,
        },
    },

    devServer: {
        host: 'test.malcovercss.link',
        port: 9040,
        index: 'app.html',
        historyApiFallback: {
            index: 'app.html',
        },
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
        contentBase: [distWebDir, staticDir],
        contentBasePublicPath: '/',
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
        new WebpackManifestPlugin({
            fileName: manifestFilePath,
        }),
    ],
})
