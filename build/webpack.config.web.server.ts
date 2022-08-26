import { QuasarUnusedPlugin } from 'quasar-unused-plugin'
import { VueSsrAssetsServerPlugin } from 'vue-ssr-assets-plugin'
import { Configuration, DefinePlugin } from 'webpack'
import merge from 'webpack-merge'
import { distClientDir, distServerDir, publicPath, srcWebDir, manifestFile, commonNodeConfig } from './webpack.common'

// ----------------------------------------------------------------------------
// Server
// ----------------------------------------------------------------------------

const serverEntryConfig = ((): Configuration => merge(commonNodeConfig, {
    entry: {
        www: `${srcWebDir}/entryServer.ts`,
    },

    output: {
        path: distServerDir,
    },

    plugins: [
        new DefinePlugin({
            'DEFINE.PUBLIC_PATH': JSON.stringify(publicPath),
            'DEFINE.CLIENT_DIST_DIR': JSON.stringify(distClientDir),
            'DEFINE.SERVER_DIST_DIR': JSON.stringify(distServerDir),
            'DEFINE.MANIFEST_FILE': JSON.stringify(manifestFile),
        }),
        new QuasarUnusedPlugin({
            enableSsr: true,
        }),
        new VueSsrAssetsServerPlugin(),
    ],
}))()

// ----------------------------------------------------------------------------
// Exports
// ----------------------------------------------------------------------------

export default serverEntryConfig
