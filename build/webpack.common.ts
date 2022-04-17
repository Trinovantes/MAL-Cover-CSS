import path from 'path'
import webpack, { DefinePlugin } from 'webpack'
import { VueLoaderPlugin } from 'vue-loader'
import { getGitHash } from './utils/secrets'
import merge from 'webpack-merge'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import nodeExternals from 'webpack-node-externals'

// ----------------------------------------------------------------------------
// Constants
// ----------------------------------------------------------------------------

// Assume we are running webpack from the project root (../)
const rootDir = path.resolve()

export const isDev = (process.env.NODE_ENV === 'development')
export const manifestFileName = 'ssr-manifest.json'
export const entryFileName = 'app.html'
export const gitHash = getGitHash(rootDir)
export const publicPath = '/public/'

export const distDir = path.resolve(rootDir, 'dist')
export const distCronDir = path.resolve(distDir, 'cron')
export const distApiDir = path.resolve(distDir, 'api')
export const distWebDir = path.resolve(distDir, 'web')
export const distWebPublicDir = path.resolve(distWebDir, 'public')
export const entryFilePath = path.resolve(distWebDir, entryFileName)
export const distSsgDir = path.resolve(distDir, 'ssg')
export const manifestFilePath = path.resolve(distSsgDir, manifestFileName)

export const srcDir = path.resolve(rootDir, 'src')
export const srcCronDir = path.resolve(srcDir, 'cron')
export const srcApiDir = path.resolve(srcDir, 'api')
export const srcWebDir = path.resolve(srcDir, 'web')
export const staticDir = path.resolve(srcDir, 'web', 'static')

export const rawDirRegexp = /\/raw\//

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
        new DefinePlugin({
            __VUE_OPTIONS_API__: JSON.stringify(false),
            __VUE_PROD_DEVTOOLS__: JSON.stringify(false),

            'DEFINE.IS_DEV': JSON.stringify(isDev),
            'DEFINE.IS_SSR': "(typeof window === 'undefined')",
            'DEFINE.GIT_HASH': JSON.stringify(gitHash),
            'DEFINE.SOCIAL_IMAGE_SIZE': JSON.stringify(800),
        }),
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
                        target: 'es2020',
                    },
                }],
            },
            {
                test: /\.vue$/,
                use: [{
                    loader: 'vue-loader',
                    options: {
                        transpileOnly: true,
                        exposeFilename: true,
                    },
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
                            placeholder: true,
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
        // This tells the server bundle to use Node-style exports
        libraryTarget: 'commonjs2',
    },

    module: {
        rules: [
            {
                // Do not emit css in the server bundle
                test: /\.(css|sass|scss)$/,
                use: 'null-loader',
                exclude: rawDirRegexp,
            },
            {
                // Do not emit fonts in the server bundle
                test: /\.(ttf|eot|woff(2)?)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: 'null-loader',
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
                            placeholder: true,
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
        // Do not externalize dependencies that need to be processed by webpack.
        // You should also whitelist deps that modify `global` (e.g. polyfills)
        nodeExternals({
            allowlist: [
                /^vue*/,
                /\.(css|sass|scss)$/,
                /\.(vue)$/,
                /\.(html)$/,
            ],
        }),
    ],
})
