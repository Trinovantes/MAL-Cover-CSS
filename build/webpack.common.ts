import path from 'node:path'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { VueLoaderPlugin } from 'vue-loader'
import webpack from 'webpack'
import merge from 'webpack-merge'
import { isDev, buildConstants, rawDirRegexp, publicPath, srcWebDir } from './BuildConstants.ts'

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
            '@css': path.resolve(srcWebDir, 'client', 'assets', 'css'),
            '@img': path.resolve(srcWebDir, 'client', 'assets', 'img'),
            '@layouts': path.resolve(srcWebDir, 'client', 'layouts'),
            '@pages': path.resolve(srcWebDir, 'client', 'pages'),
        },
    },

    plugins: [
        new webpack.DefinePlugin(buildConstants),
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

export const commonWebConfig = merge.default(commonConfig, {
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
                                    ? '@use "sass:color"\n@use "sass:math"\n@use "@css/variables.scss" as *\n' + content
                                    : '@use "sass:color"; @use "sass:math"; @use "@css/variables.scss" as *; ' + content
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

export const commonNodeConfig = merge.default(commonConfig, {
    target: 'node',

    output: {
        libraryTarget: 'commonjs2',
        filename: '[name].cjs',
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
        {
            '@sentry/node': 'commonjs @sentry/node',
            'better-sqlite3': 'commonjs better-sqlite3',
            'express': 'commonjs express',
        },
        /^bun(:\w+)?/i,
    ],
})
