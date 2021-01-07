import { merge } from 'webpack-merge'
import { VueLoaderPlugin } from 'vue-loader'
import VueSSRServerPlugin from 'vue-server-renderer/server-plugin'

import { commonNodeConfig } from './webpack.config.common'
import { srcWebDir } from './webpack.constants'

const serverEntryConfig = merge(commonNodeConfig, {
    entry: {
        server: `${srcWebDir}/entryServer.ts`,
    },

    output: {
        // Required by vue-server-renderer
        libraryTarget: 'commonjs2',
    },

    plugins: [
        new VueLoaderPlugin(),
        new VueSSRServerPlugin(),
    ],

    module: {
        rules: [{
            test: /\.(css|sass|scss)$/,
            use: [
                'null-loader',
            ],
        }],
    },
})

export default serverEntryConfig
