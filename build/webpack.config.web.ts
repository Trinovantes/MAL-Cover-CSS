import path from 'path'
import { merge } from 'webpack-merge'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import { commonConfig, isDev, staticDir, srcWebDir, rawDirRegexp, publicPath, manifestFilePath, distWebPublicDir, distWebDir } from './webpack.common'
import { Chunk } from 'webpack'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { WebpackManifestPlugin } from 'webpack-manifest-plugin'

// ----------------------------------------------------------------------------
// Client
// ----------------------------------------------------------------------------

function createFilenameFn(ext: string) {
    return (pathData: unknown): string => {
        const defaultChunkName = isDev
            ? `[name].${ext}`
            : `[name].[contenthash].${ext}`

        const data = pathData as { chunk: Chunk }
        const filename = data.chunk.id
        if (typeof filename !== 'string') {
            return defaultChunkName
        }

        const pathParts = filename.split('_')
        pathParts.reverse()
        if (pathParts[0] !== 'vue') {
            return defaultChunkName
        }

        return defaultChunkName.replace('[name]', pathParts[1])
    }
}

export default merge(commonConfig, {
    target: 'web',

    entry: {
        main: path.resolve(srcWebDir, 'entryClient.ts'),
    },

    output: {
        path: distWebPublicDir,
        publicPath: publicPath,
        filename: createFilenameFn('js'),
        chunkFilename: createFilenameFn('js'),
    },

    optimization: {
        chunkIds: 'named',
    },

    devServer: {
        host: 'test.malcovercss.link',
        port: 9004,
        historyApiFallback: {
            index: 'app.html',
        },
        contentBase: [
            distWebDir,
            staticDir,
        ],
        contentBasePublicPath: [
            '/',
            '/',
        ],
        index: 'app.html',
        writeToDisk: (filePath) => {
            return filePath.endsWith('.html')
        },
        proxy: {
            '/api': 'http://localhost:3000',
        },
    },

    module: {
        rules: [
            {
                test: /\.(sass|scss)$/,
                use: [
                    MiniCssExtractPlugin.loader,
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
                    MiniCssExtractPlugin.loader,
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
                    to: distWebDir,
                },
            ],
        }),
        new MiniCssExtractPlugin({
            filename: createFilenameFn('css'),
            chunkFilename: createFilenameFn('css'),
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
