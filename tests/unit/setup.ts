import { RuntimeSecret } from '@/common/utils/RuntimeSecret'

// eslint-disable-next-line @typescript-eslint/no-empty-function
console.debug = () => {}

// eslint-disable-next-line @typescript-eslint/no-empty-function
console.info = () => {}

// eslint-disable-next-line @typescript-eslint/no-empty-function
console.warn = () => {}

process.env[RuntimeSecret.IS_TEST] = 'true'
