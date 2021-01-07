import merge from 'webpack-merge'
import { VueLoaderPlugin } from 'vue-loader'
import VueSSRClientPlugin from 'vue-server-renderer/client-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

import { commonConfig } from './webpack.config.common'
import { distClientDir, isDev, publicPath, srcWebDir } from './webpack.constants'
import webpack, { WebpackPluginInstance } from 'webpack'

// ----------------------------------------------------------------------------
// SSR Client
// ----------------------------------------------------------------------------

const clientEntryConfig = merge(commonConfig, {
    target: 'web',

    // We cannot set config.context because webpack-dev-middleware expects relative paths
    entry: {
        client: isDev
            ? ['webpack-hot-middleware/client', `${srcWebDir}/entryClient.ts`]
            : `${srcWebDir}/entryClient.ts`,
    },
    output: {
        path: distClientDir,

        // Important: Need to be a distinct subdir so that Express can match it before its catchall clause
        // Does not need to be a real path on disk, just need to match the route in www.ts
        publicPath: publicPath,

        filename: isDev
            ? '[name].js'
            : '[name].[chunkhash].js',
    },

    plugins: [
        !isDev && new MiniCssExtractPlugin({
            filename: isDev
                ? '[name].css'
                : '[name].[contenthash].css',
            chunkFilename: isDev
                ? '[id].css'
                : '[id].[contenthash].css',
        }),
        isDev && new webpack.HotModuleReplacementPlugin(),
        new VueLoaderPlugin(),
        new VueSSRClientPlugin(),
    ].filter(Boolean) as Array<WebpackPluginInstance>,

    module: {
        rules: [
            {
                test: /\.(scss|sass)$/,
                use: [
                    isDev
                        ? 'style-loader'
                        : MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            esModule: false,
                        },
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            additionalData: (content: string, loaderContext: { resourcePath: string }): string => {
                                return (loaderContext.resourcePath.endsWith('sass'))
                                    ? '@import "@css/variables.scss"\n' + content
                                    : '@import "@css/variables.scss";' + content
                            },
                        },
                    },
                ],
            },
            {
                test: /\.css$/,
                use: [
                    isDev
                        ? 'style-loader'
                        : MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            esModule: false,
                        },
                    },
                ],
            },
        ],
    },
})

export default clientEntryConfig
