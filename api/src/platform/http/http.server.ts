import { Context, ErrorHandler, Hono, MiddlewareHandler } from 'hono';
import { LoggerService } from '@platform/logger/logger.service';
import { ConfigService } from '@platform/config/config.service';
import { serve, ServerType } from '@hono/node-server';
import { corsMiddleware, csrfMiddleware, bodyLimit } from './middleware';

export class HttpServer {
    private static instance: HttpServer | null = null;
    private app: Hono;
    private server: ServerType | null = null;

    private constructor(
        private readonly config: ConfigService,
        private readonly logger: LoggerService,
    ) {
        this.app = new Hono();
        this.setBaseMiddlewares();
    }

    static getInstance(config: ConfigService, logger: LoggerService): HttpServer {
        if (!HttpServer.instance) {
            HttpServer.instance = new HttpServer(config, logger);
        }
        return HttpServer.instance;
    }

    resetInstance(): void {
        HttpServer.instance = null;
    }

    setBaseMiddlewares() {
        this.app.use(corsMiddleware);
        this.app.use(csrfMiddleware);
        this.app.use(bodyLimit());
    }

    use(middleware: MiddlewareHandler): this {
        this.app.use(middleware);
        return this;
    }

    useAll(middlewares: MiddlewareHandler[]): this {
        for (const middleware of middlewares) {
            this.use(middleware);
        }
        return this;
    }

    registerRoutes(router: Hono): this {
        for (const route of router.routes) {
            this.logger.debug('Registering route', { method: route.method, path: route.path });
        }
        this.app.route('/', router);
        return this;
    }

    async start(): Promise<void> {
        this.server = serve({
            fetch: this.app.fetch,
            port: this.config.port,
        });

        this.server.on('error', (err: Error) => {
            console.log(err);
        });
    }

    async stop(): Promise<void> {
        if (!this.server) return;

        return new Promise((resolve, reject) => {
            this.server?.close((err) => {
                if (err) {
                    console.log('serverType', err);
                    reject(err);
                } else {
                    console.log('HTTP server stopped successfully.');
                    resolve();
                }
            });
        });
    }

    getApp(): Hono {
        return this.app;
    }

    onError(handler: ErrorHandler): this {
        this.app.onError(handler);
        return this;
    }
}
