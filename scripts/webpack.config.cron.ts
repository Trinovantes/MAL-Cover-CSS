import { merge } from 'webpack-merge'
import nodeExternals from 'webpack-node-externals'

import { commonConfig } from './webpack.config.common'
import { srcCronDir, distCronDir } from './webpack.constants'

// ----------------------------------------------------------------------------
// Cron
// ----------------------------------------------------------------------------

const expressConfig = merge(commonConfig, {
    target: 'node',

    entry: {
        generator: `${srcCronDir}/generator.ts`,
        scraper: `${srcCronDir}/scraper.ts`,
    },
    output: {
        path: distCronDir,

        // Needed by VSCode debugger to find original aliased paths
        devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    },

    externals: [
        nodeExternals(),
    ],
})

export default expressConfig
