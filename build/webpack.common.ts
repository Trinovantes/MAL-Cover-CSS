import path from 'node:path'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { VueLoaderPlugin } from 'vue-loader'
import webpack, { DefinePlugin } from 'webpack'
import merge from 'webpack-merge'
import { isDev, srcDir, buildConstants, rawDirRegexp, publicPath } from './BuildConstants'

// ----------------------------------------------------------------------------
// Common
// ----------------------------------------------------------------------------

const commonConfig: webpack.Configuration = {
    mode: isDev
        ? 'development'
        : 'production',
    devtool: 'source-map',

    resolve: {
        extensions: ['.ts', '.js', '.vue', '.json', 'scss', '.css'],
        alias: {
            // Need to match aliases in tsconfig.json
            '@': path.resolve(srcDir),
        },
    },

    plugins: [
        new DefinePlugin(buildConstants),
        new VueLoaderPlugin(),
    ],

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'esbuild-loader',
                    options: {
                        loader: 'ts',
                    },
                }],
            },
            {
                test: /\.vue$/,
                use: [{
                    loader: 'vue-loader',
                }],
            },
            {
                test: rawDirRegexp,
                type: 'asset/source',
            },
        ],
    },
}

export const commonWebConfig = merge(commonConfig, {
    target: 'web',

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
                                    ? '@use "sass:math"\n @import "@/web/client/assets/css/variables.scss"\n' + content
                                    : '@use "sass:math";  @import "@/web/client/assets/css/variables.scss"; ' + content
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
                test: /\.(jpe?g|png|gif|webp)$/i,
                use: [
                    {
                        loader: 'responsive-loader',
                        options: {
                            format: 'webp',
                            publicPath,
                        },
                    },
                ],
            },
        ],
    },
})

export const commonNodeConfig = merge(commonConfig, {
    target: 'node',

    output: {
        libraryTarget: 'commonjs2',
    },

    module: {
        rules: [
            {
                // Do not emit css in the server bundle
                test: /\.(css|sass|scss)$/,
                use: 'null-loader',
            },
            {
                // Do not emit fonts in the server bundle
                test: /\.(ttf|eot|woff(2)?)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: 'null-loader',
            },
            {
                test: /\.(jpe?g|png|gif|webp)$/i,
                use: [
                    {
                        loader: 'responsive-loader',
                        options: {
                            format: 'webp',
                            publicPath,

                            // Do not emit images in the server bundle
                            emitFile: false,
                        },
                    },
                ],
            },
        ],
    },

    externals: [
        'better-sqlite3',
        'express',
    ],
})
