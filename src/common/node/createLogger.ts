import pino, { LoggerOptions } from 'pino'
import pretty, { PrettyOptions } from 'pino-pretty'

const pinoOpts: LoggerOptions = {
    enabled: !process.env.CI,
    level: 'trace',
}

const pinoPrettyOpts: PrettyOptions = {
    sync: true,
}

export function createLogger() {
    return DEFINE.IS_DEV
        ? pino(pinoOpts, pretty(pinoPrettyOpts))
        : pino(pinoOpts)
}
