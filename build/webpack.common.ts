import path from 'path'
import webpack, { DefinePlugin } from 'webpack'
import { VueLoaderPlugin } from 'vue-loader'
import { getGitHash } from './secrets'

// ----------------------------------------------------------------------------
// Constants
// ----------------------------------------------------------------------------

// Assume we are running webpack from the project root (../)
const rootDir = path.resolve()

export const isDev = (process.env.NODE_ENV === 'development')
export const gitHash = getGitHash(rootDir)
export const publicPath = '/public/'

export const distDir = path.resolve(rootDir, 'dist')
export const distCronDir = path.resolve(distDir, 'cron')
export const distApiDir = path.resolve(distDir, 'api')
export const distWebDir = path.resolve(distDir, 'web')
export const distWebPublicDir = path.resolve(distDir, 'web', 'public')
export const distSsgDir = path.resolve(distDir, 'ssg')
export const manifestFilePath = path.resolve(distDir, 'ssg', 'ssr-manifest.json')

export const srcDir = path.resolve(rootDir, 'src')
export const srcCronDir = path.resolve(srcDir, 'cron')
export const srcApiDir = path.resolve(srcDir, 'api')
export const srcWebDir = path.resolve(srcDir, 'web')
export const staticDir = path.resolve(srcDir, 'web', 'static')

export const rawDirRegexp = /\/assets\/raw\//

// ----------------------------------------------------------------------------
// Common
// ----------------------------------------------------------------------------

export const commonConfig: webpack.Configuration = {
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
        }),
        new VueLoaderPlugin(),
    ],

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'ts-loader',
                    options: {
                        appendTsSuffixTo: [/\.vue$/],
                    },
                }],
            },
            {
                test: /\.vue$/,
                use: 'vue-loader',
            },
            {
                test: rawDirRegexp,
                type: 'asset/source',
            },
        ],
    },
}
