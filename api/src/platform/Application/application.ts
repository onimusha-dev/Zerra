import { createHealthRoutes, HealthController } from '@modules/health';
import { ConfigService } from '@platform/config/config.service';
import { DatabaseService } from '@platform/database';
import { HttpServer } from '@platform/http/http.server';
import { LoggerService } from '@platform/logger/logger.service';
import { Hono } from 'hono';

import { container, ServiceKeys } from './container';

export class Application {
    private static instance: Application | null = null;
    private initialized: boolean = false;

    private config!: ConfigService;
    private logger!: LoggerService;
    private database!: DatabaseService;
    private httpServer!: HttpServer;

    static getInstance(): Application {
        if (!Application.instance) {
            Application.instance = new Application();
        }
        return Application.instance;
    }

    static resetInstance(): void {
        Application.instance = null;
    }

    async bootstrap(): Promise<void> {
        if (this.initialized) {
            throw new Error('Application initialisation failed.\nApplication Initialised Already!');
        }
        try {
            // 1-4: Setup the "Infrastructure" (The Foundation)
            // they depends on each other -> order matters
            await this.initializeConfig();
            await this.initializeLogger();
            await this.initializeDatabase;

            // 4: Setup the HTTP Server
            await this.initializeHttpServer();

            // 5: Assemble all the Modules
            await this.registerModules();

            // 6: Connecting the server to thte socket
            await this.httpServer.start();

            this.initialized = true;
            this.logger.info('Application Started Successfully.');
        } catch (error) {
            console.error('Failed to bootstrap application:', error);
            throw error;
        }
        return;
    }

    private async initializeConfig(): Promise<void> {
        this.config = ConfigService.getInstance();
        container.register(ServiceKeys.CONFIG, this.config);
    }

    private async initializeLogger(): Promise<void> {
        this.logger = LoggerService.getInstance(this.config);
        container.register(ServiceKeys.LOGGER, this.logger);
    }

    private async initializeDatabase(): Promise<void> {
        this.database = DatabaseService.getInstance(this.logger);
        await this.database.connect();
        container.register(ServiceKeys.DATABASE, this.database);
    }

    private async initializeHttpServer(): Promise<void> {
        this.httpServer = HttpServer.getInstance(this.config, this.logger);
        this.httpServer.onError((err, ctx) => {
            this.logger.error(`Unhandled error: ${err.message}`, {
                path: ctx.req.path,
                method: ctx.req.method,
                error: err,
            });
            return ctx.json({ error: 'Internal Server Error', message: err.message }, 500);
        });
        container.register(ServiceKeys.HTTP_SERVER, this.httpServer);
    }

    private registerModules() {
        const mainRouter = new Hono();
        const healthController = new HealthController();

        mainRouter.route('/health', createHealthRoutes(healthController));

        this.httpServer.registerRoutes(mainRouter);
        this.logger.debug('All routes configured.');
    }
}
