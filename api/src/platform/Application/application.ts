import { createHealthRoutes, HealthController } from '@modules/health';
import { DatabaseService } from '@platform/database';
import { HttpServer } from '@platform/http/http.server';
import { LoggerService } from '@platform/logger/logger.service';
import { Hono } from 'hono';
import { container, ServiceKeys } from './container';
import { CacheService } from '@platform/cache';
import { createRequestLogger } from '@platform/http/middleware/request-logger';
import { createUsersRoutes, UsersController } from '@modules/users';
import { AuthController } from '@modules/auth/auth.controller';
import { createAuthRoutes } from '@modules/auth/auth.routes';
import { AuthService } from '@modules/auth/auth.service';
import { ConfigService } from '@platform/config';
import { SmtpService } from '@shared/smtp/smtp.service';
import { HTTPException } from 'hono/http-exception';
import { AppError } from '@shared/json/apiError';
import { AuthMiddleware } from '@platform/http/middleware';
import { UserRepository } from '@modules/users/users.repository';
import { AppEnv } from '@platform/http/types';
import { UsersService } from '@modules/users/users.service';
import { PostController, PostService, PostRepository, createPostRoutes } from '@modules/posts';

export class Application {
    private static instance: Application | null = null;
    private initialized: boolean = false;

    private config!: ConfigService;
    private logger!: LoggerService;
    private smtp!: SmtpService;
    private database!: DatabaseService;
    private cache!: CacheService;
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
            await this.initializeSmtp();
            await this.initializeDatabase();
            await this.initialiseCache();

            // 5: Setup the HTTP Server
            await this.initializeHttpServer();

            // 6: Assemble all the Modules
            await this.registerModules();

            // 7: Connecting the server to thte socket
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

    private async initializeSmtp(): Promise<void> {
        this.smtp = SmtpService.getInstance(this.config, this.logger);
    }

    private async initializeDatabase(): Promise<void> {
        this.database = DatabaseService.getInstance(this.logger);
        await this.database.connect();
        container.register(ServiceKeys.DATABASE, this.database);
        const health = await this.database.healthCheck();
        this.logger.info('Database initialized', { status: health.status });
    }

    private async initialiseCache(): Promise<void> {
        this.cache = CacheService.getInstance(this.config, this.logger);
        await this.cache.connect();
        container.register(ServiceKeys.CACHE, this.cache);
        const health = await this.cache.healthCheck();
        this.logger.info('Redis cache initialized', { status: health.status });
    }

    private async initializeHttpServer(): Promise<void> {
        this.httpServer = HttpServer.getInstance(this.config, this.logger);
        this.httpServer.use(createRequestLogger(this.logger));
        this.httpServer.onError((err, ctx) => {
            // Handle HTTPExceptions specifically (like 401, 403, 404 from Hono)
            if (err instanceof HTTPException) {
                this.logger.warn(`HTTP Error: ${err.message}`, {
                    path: ctx.req.path,
                    method: ctx.req.method,
                    status: err.status,
                });
                return err.getResponse();
            }

            // Handle custom AppErrors (like ValidationError, NotFoundError, etc.)
            if (err instanceof AppError) {
                this.logger.warn(`${err.name}: ${err.message}`, {
                    path: ctx.req.path,
                    method: ctx.req.method,
                    statusCode: err.statusCode,
                    code: err.code,
                });
                return ctx.json(err.toJSON(), err.statusCode as any);
            }

            // Handle all other internal errors
            this.logger.error(`Critical Error: ${err.message}`, {
                path: ctx.req.path,
                method: ctx.req.method,
                error: err, // Logger handles the stack trace automatically via pino-pretty
            });

            // Return a safe error response to the client
            return ctx.json(
                {
                    success: false,
                    message: this.config.isProduction
                        ? 'An unexpected error occurred'
                        : err.message,
                    error: {
                        code: 'INTERNAL_SERVER_ERROR',
                        details: this.config.isProduction ? undefined : { stack: err.stack },
                    },
                },
                500,
            );
        });
        container.register(ServiceKeys.HTTP_SERVER, this.httpServer);
    }

    private registerModules() {
        const mainRouter = new Hono<AppEnv>();
        const healthController = new HealthController(this.database);

        const userRepository = new UserRepository(this.database);
        const authService = new AuthService(userRepository, this.logger, this.cache, this.smtp);
        const authController = new AuthController(
            this.config,
            authService,
            this.cache,
            this.logger,
        );

        const userService = new UsersService(userRepository, this.logger);
        const usersController = new UsersController(userService, this.cache);

        const postRepository = new PostRepository(this.database);
        const postService = new PostService(postRepository, userService, this.logger);
        const postController = new PostController(postService);

        const authMiddleware = new AuthMiddleware(this.config, this.logger, authService);
        mainRouter.route('/health', createHealthRoutes(healthController));
        mainRouter.route('/auth', createAuthRoutes(authController, authMiddleware));
        mainRouter.route('/users', createUsersRoutes(usersController, authMiddleware));
        mainRouter.route('/posts', createPostRoutes(postController, authMiddleware));

        this.httpServer.registerRoutes(mainRouter);
        this.logger.debug('All routes configured.');
    }
}
