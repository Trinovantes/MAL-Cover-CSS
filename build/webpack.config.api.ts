import { merge } from 'webpack-merge'
import { commonConfig, distApiDir, srcApiDir } from './webpack.common'
import nodeExternals from 'webpack-node-externals'

// ----------------------------------------------------------------------------
// Api
// ----------------------------------------------------------------------------

export default merge(commonConfig, {
    target: 'node',

    entry: {
        www: `${srcApiDir}/www.ts`,
    },

    output: {
        path: distApiDir,
    },

    externals: [
        nodeExternals(),
    ],
})
