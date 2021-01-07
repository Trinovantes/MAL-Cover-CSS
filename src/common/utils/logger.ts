import Constants from '@common/Constants'
import winston, { format, transports } from 'winston'

export function createLogger(module?: string): winston.Logger {
    return winston.createLogger({
        format: format.combine(
            format.colorize(),
            format.label({ label: Constants.APP_NAME }),
            format.timestamp(),
            format.splat(),
            format.printf(({ level, message, timestamp, label }): string => {
                if (module) {
                    return `[${label as string}] ${timestamp as string} [${level}] [${module}] ${message}`
                } else {
                    return `[${label as string}] ${timestamp as string} [${level}] ${message}`
                }
            }),
        ),
        transports: [
            new transports.Console({
                level: 'debug',
            }),
        ],
    })
}

export const logger = createLogger()
