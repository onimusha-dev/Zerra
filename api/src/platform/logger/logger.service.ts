import { ConfigService } from '@platform/config/config.service';
import { Logger, pino } from 'pino';

export class LoggerService {
    private static instance: LoggerService | null = null;
    private logger: Logger;
    private readonly serviceName: String = 'backend';

    constructor(private readonly config: ConfigService) {
        this.logger = this.createLogger();
    }

    /**
     *
     * @param config iinstance of config service
     * @returns istance of logger service
     */
    static getInstance(config: ConfigService): LoggerService {
        if (!this.instance) {
            this.instance = new LoggerService(config);
        }
        return this.instance;
    }

    resetInstance(): void {
        LoggerService.instance = null;
    }

    createLogger(): Logger {
        const isProduction = this.config.isProduction;

        const baseOptions = {
            level: this.config.logLevel.toString(),
            base: {
                service: this.serviceName,
            },
            timestamp: pino.stdTimeFunctions.isoTime,
        };

        if (isProduction) {
            return pino(baseOptions);
        }

        return pino({
            ...baseOptions,
            transport: {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    translateTime: 'yyyy-mm-dd HH:MM:ss.l',
                    ignore: 'pid,hostname',
                },
            },
        });
    }

    info(message: string, obj?: any) {
        if (obj) {
            this.logger.info(obj, message);
        } else {
            this.logger.info(message);
        }
    }

    trace() {}
    warn(message: string, obj?: any) {
        if (obj) {
            this.logger.warn(obj, message);
        } else {
            this.logger.warn(message);
        }
    }
    debug(message: string, obj?: any) {
        if (obj) {
            this.logger.debug(obj, message);
        } else {
            this.logger.debug(message);
        }
    }
    error(message: string, obj?: any) {
        if (obj) {
            this.logger.error(obj, message);
        } else {
            this.logger.error(message);
        }
    }
    fatal(message: string, obj?: any) {
        if (obj) {
            this.logger.fatal(obj, message);
        } else {
            this.logger.fatal(message);
        }
    }
}
