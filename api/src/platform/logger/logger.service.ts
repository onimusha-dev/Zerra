import { ConfigService } from '@platform/config';
import pino, { type Logger } from 'pino';

interface LogMeta {
    [key: string]: unknown;
}

export class LoggerService {
    private static instance: LoggerService | null = null;
    private logger: Logger;
    private readonly serviceName: string = 'backend';

    constructor(private readonly config: ConfigService) {
        this.logger = this.createLogger();
    }

    static getInstance(config: ConfigService): LoggerService {
        if (!this.instance) {
            this.instance = new LoggerService(config);
        }
        return this.instance;
    }

    resetInstance(): void {
        LoggerService.instance = null;
    }

    private createLogger(): Logger {
        const nodeEnv = (
            process.env.NODE_ENV ||
            this.config.nodeEnv ||
            'development'
        ).toLowerCase();
        const isProduction = nodeEnv === 'production';
        const isTest = nodeEnv === 'test';

        const baseOptions = {
            level: this.config.logLevel || 'debug',
            base: {
                service: this.serviceName,
            },
            timestamp: pino.stdTimeFunctions.isoTime,
            serializers: {
                err: pino.stdSerializers.err,
                error: pino.stdSerializers.err,
            },
        };

        // Always use standard JSON logging in production or test environments
        if (isProduction || isTest) {
            return pino(baseOptions);
        }

        // Only attempt to use pino-pretty in development
        try {
            return pino({
                ...baseOptions,
                transport: {
                    target: 'pino-pretty',
                    options: {
                        colorize: true,
                        translateTime: 'HH:MM:ss',
                        ignore: 'pid,hostname,service',
                        errorLikeObjectKeys: ['err', 'error'],
                        levelFirst: false,
                        singleLine: true,
                        colorizeObjects: true,
                        customColors:
                            'trace:gray,debug:blue,info:green,warn:yellow,error:red,fatal:bgRed',
                        messageFormat: '{msg}',
                    },
                },
            });
        } catch (error) {
            // Fallback to base logger if pino-pretty fails to load/initialize
            const logger = pino(baseOptions);
            logger.warn(
                { error },
                'Failed to initialize pino-pretty transport, falling back to standard logger',
            );
            return logger;
        }
    }

    /**
     * Robust argument formatter to ensure Errors always have stack traces in terminal.
     */
    private formatArgs(msgOrObj: any, obj?: any): [any, string?] | [string] {
        // If first arg is an Error
        if (msgOrObj instanceof Error) {
            const errorObj = { err: msgOrObj, error: msgOrObj };
            return obj
                ? [{ ...errorObj, meta: obj }, msgOrObj.message]
                : [errorObj, msgOrObj.message];
        }

        // If second arg is an Error
        if (obj instanceof Error) {
            return [{ err: obj, error: obj }, msgOrObj];
        }

        // If second arg is an object that might contain an Error
        if (obj && typeof obj === 'object') {
            const potentialErr = obj.err || obj.error || obj.exception;
            if (potentialErr instanceof Error) {
                return [{ ...obj, err: potentialErr, error: potentialErr }, msgOrObj];
            }
            return [obj, msgOrObj];
        }

        // Generic case
        if (obj !== undefined) {
            return [{ meta: obj }, msgOrObj];
        }

        return [msgOrObj];
    }

    info(message: any, obj?: any) {
        const args = this.formatArgs(message, obj);
        // @ts-ignore
        this.logger.info(...args);
    }

    trace(message: any, obj?: any) {
        const args = this.formatArgs(message, obj);
        // @ts-ignore
        this.logger.trace(...args);
    }

    warn(message: any, obj?: any) {
        const args = this.formatArgs(message, obj);
        // @ts-ignore
        this.logger.warn(...args);
    }

    debug(message: any, obj?: any) {
        const args = this.formatArgs(message, obj);
        // @ts-ignore
        this.logger.debug(...args);
    }

    error(message: any, obj?: any) {
        const args = this.formatArgs(message, obj);
        // @ts-ignore
        this.logger.error(...args);
    }

    fatal(message: any, obj?: any) {
        const args = this.formatArgs(message, obj);
        // @ts-ignore
        this.logger.fatal(...args);
    }

    logRequest(
        method: string,
        url: string,
        statusCode: number,
        durationMs: number,
        meta?: LogMeta,
    ): void {
        const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

        const logData = {
            ...meta,
            http: {
                method,
                url,
                statusCode,
                durationMs,
            },
        };

        this.logger[level](logData, `${method} ${url} ${statusCode}`);
    }

    getPinoLogger(): Logger {
        return this.logger;
    }
}
