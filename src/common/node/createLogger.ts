import pino, { type LoggerOptions } from 'pino'
import pretty, { type PrettyOptions } from 'pino-pretty'

const pinoOpts: LoggerOptions = {
    enabled: !process.env.CI,
    level: 'trace',
}

const pinoPrettyOpts: PrettyOptions = {
    sync: true,
}

export function createLogger() {
    return __IS_DEV__
        ? pino(pinoOpts, pretty(pinoPrettyOpts))
        : pino(pinoOpts)
}
