import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { buildConstants } from './build/BuildConstants.ts'
import replace from '@rollup/plugin-replace'

const isContinuousIntegration = Boolean(process.env.CI)

export default defineConfig({
    plugins: [
        replace({
            values: buildConstants,
            delimiters: ['\\b', ''],
            preventAssignment: true,
        }),
        vue(),
    ],

    test: {
        silent: isContinuousIntegration,
        restoreMocks: true,
        dir: './tests/unit',
        pool: 'forks',
    },
})
