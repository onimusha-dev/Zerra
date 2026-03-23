import { serve, ServerType } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { LoggerService } from '@platform/logger/logger.service';
import { ErrorHandler, Hono, MiddlewareHandler } from 'hono';

import { bodyLimit, createCorsMiddleware, createCsrfMiddleware } from './middleware';
import { ConfigService } from '@platform/config';
import { AppEnv } from './types';

export class HttpServer {
    private static instance: HttpServer | null = null;
    private app: Hono<AppEnv>;
    private server: ServerType | null = null;

    private constructor(
        private readonly config: ConfigService,
        private readonly logger: LoggerService,
    ) {
        this.app = new Hono<AppEnv>();
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
        this.app.use(createCorsMiddleware(this.config));
        this.app.use(createCsrfMiddleware(this.config));
        this.app.use(bodyLimit());

        // Creative Static Serving: Serve files from 'uploads' and add a custom header
        this.app.use('/uploads/*', async (c, next) => {
            c.header('X-Zerra-Media', 'true');
            c.header('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
            await next();
        });

        this.app.use('/uploads/*', serveStatic({ root: './' }));
    }

    use(middleware: MiddlewareHandler<AppEnv>): this {
        this.app.use(middleware);
        return this;
    }

    useAll(middlewares: MiddlewareHandler<AppEnv>[]): this {
        for (const middleware of middlewares) {
            this.use(middleware);
        }
        return this;
    }

    registerRoutes(router: Hono<AppEnv, any, any>): this {
        for (const route of router.routes) {
            this.logger.debug('Registering route', { method: route.method, path: route.path });
        }
        this.app.route('/', router);
        return this;
    }

    async start(): Promise<void> {
        this.server = serve(
            {
                fetch: this.app.fetch,
                hostname: '0.0.0.0',
                port: this.config.port,
            },
            (info) => {
                this.logger.info(`Server is running on http://0.0.0.0:${info.port}`);
            },
        );

        this.server.on('error', (err: Error) => {
            this.logger.error('Server error', { error: err });
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

    getApp(): Hono<AppEnv> {
        return this.app;
    }

    onError(handler: ErrorHandler): this {
        this.app.onError(handler);
        return this;
    }
}
