import path from 'node:path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import ViteRequireContext from '@originjs/vite-plugin-require-context'
import { buildConstants } from './build/BuildConstants.js'
import replace from '@rollup/plugin-replace'

const isContinuousIntegration = Boolean(process.env.CI)

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },

    plugins: [
        replace({
            values: buildConstants,
            delimiters: ['\\b', ''],
        }),
        vue(),
        ViteRequireContext(),
    ],

    test: {
        silent: isContinuousIntegration,
        restoreMocks: true,
        dir: './tests/unit',
    },
})
