import { QuasarUnusedPlugin } from 'quasar-unused-plugin'
import { VueSsrAssetsServerPlugin } from 'vue-ssr-assets-plugin'
import { Configuration } from 'webpack'
import merge from 'webpack-merge'
import { commonNodeConfig } from './webpack.common'
import { distServerDir, distServerTemplate, srcWebDir, srcWebTemplate } from './BuildConstants'
import path from 'node:path'
import CopyWebpackPlugin from 'copy-webpack-plugin'

// ----------------------------------------------------------------------------
// Server
// ----------------------------------------------------------------------------

export default ((): Configuration => merge(commonNodeConfig, {
    entry: {
        www: path.join(srcWebDir, 'entryServer.ts'),
    },

    output: {
        path: distServerDir,
    },

    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: srcWebTemplate,
                    to: distServerTemplate,
                },
            ],
        }),
        new QuasarUnusedPlugin({
            enableSsr: true,
        }),
        new VueSsrAssetsServerPlugin(),
    ],
}))()
