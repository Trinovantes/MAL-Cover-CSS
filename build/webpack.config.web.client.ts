import CopyWebpackPlugin from 'copy-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { QuasarUnusedPlugin } from 'quasar-unused-plugin'
import { VueSsrAssetsClientPlugin } from 'vue-ssr-assets-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import merge from 'webpack-merge'
import { distClientDir, publicPath, staticDir, srcWebDir, manifestFile, commonWebConfig, isDev, distServerDir } from './webpack.common'
import type { Configuration } from 'webpack'

// ----------------------------------------------------------------------------
// Client
// ----------------------------------------------------------------------------

const clientEntryConfig = ((): Configuration => merge(commonWebConfig, {
    entry: {
        main: `${srcWebDir}/entryClient.ts`,
    },

    output: {
        path: distClientDir,

        filename: isDev
            ? '[name].js'
            : '[name].[contenthash].js',

        // Important: Need to be a distinct subdir so that Express can match it before its catchall clause
        // Does not need to be a real path on disk, just need to match the route in www.ts
        publicPath,
    },

    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: staticDir,
                    to: distServerDir,
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
            fileName: manifestFile,
        }),
        new BundleAnalyzerPlugin({
            analyzerMode: 'disabled',
            generateStatsFile: false,
        }),
    ],
}))()

// ----------------------------------------------------------------------------
// Exports
// ----------------------------------------------------------------------------

export default clientEntryConfig
