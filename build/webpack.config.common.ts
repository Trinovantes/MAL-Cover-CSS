import path from 'path'
import webpack, { DefinePlugin } from 'webpack'
import nodeExternals from 'webpack-node-externals'

import { isDev, srcDir, srcWebDir, distServerDir, buildDir } from './webpack.constants'
import merge from 'webpack-merge'

// ----------------------------------------------------------------------------
// Common
// ----------------------------------------------------------------------------

export const commonConfig: webpack.Configuration = {
    mode: isDev
        ? 'development'
        : 'production',
    devtool: isDev
        ? 'source-map'
        : false,

    resolve: {
        symlinks: false,
        extensions: ['.ts', '.js', '.vue', '.json', '.scss', '.css'],
        alias: {
            // Need to match aliases in tsconfig.json
            '@build': buildDir,

            '@common': path.resolve(srcDir, 'common'),
            '@cron': path.resolve(srcDir, 'cron'),
            '@web': path.resolve(srcDir, 'web'),

            '@api': path.resolve(srcWebDir, 'api'),
            '@views': path.resolve(srcWebDir, 'views'),

            '@css': path.resolve(srcWebDir, 'assets/css'),
            '@img': path.resolve(srcWebDir, 'assets/img'),
            '@raw': path.resolve(srcWebDir, 'assets/raw'),

            // https://github.com/vuejs-templates/webpack/issues/215
            vue: isDev
                ? 'vue/dist/vue.js'
                : 'vue/dist/vue.min.js',
        },
    },

    plugins: [
        new DefinePlugin({
            'DEFINE.IS_DEV': JSON.stringify(isDev),
        }),
    ],

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            appendTsSuffixTo: [/\.vue$/],
                        },
                    },
                ],
            },
            {
                test: /\.vue$/,
                use: [
                    'vue-loader',
                ],
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 10 * 1024 * 1024,
                            name: 'img/[name].[contenthash].[ext]',
                            esModule: false,
                        },
                    },
                ],
            },
            {
                test: /\.(ttf|eot|woff(2)?)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'url-loader',
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: 'html-loader',
                        options: {
                            // Do not remove HTML comment <!--vue-ssr-outlet--> that's needed by Vue SSR Plugin
                            minimize: false,
                        },
                    },
                ],
            },
        ],
    },
}

// ----------------------------------------------------------------------------
// Common Node
// ----------------------------------------------------------------------------

export const commonNodeConfig = merge(commonConfig, {
    target: 'node',

    output: {
        path: distServerDir,

        // Needed by VSCode debugger to find original aliased paths
        devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    },

    externals: [
        nodeExternals({
            allowlist: [
                /\.(css|sass|scss)$/,
                /\?vue&type=style/,
            ],
        }),
    ],
})
