import { configDotenv } from 'dotenv';
import z from 'zod';
configDotenv();

const configSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'trace', 'fatal']).default('debug'),
    PORT: z.string().default('5500').transform(Number),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    CORS_ORIGIN: z.string(),
    PNPM_PACKAGE_VERSION: z.string().default('1.0.0'),
});

type ConfigSchema = z.infer<typeof configSchema>;

export class ConfigService {
    private static instance: ConfigService | null = null;
    private readonly config: ConfigSchema;

    private constructor() {
        try {
            this.config = configSchema.parse(process.env);
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error('Invalid environment configuration:');
                error.issues.forEach((err) => {
                    console.error(`  - ${err.path.join('.')}: ${err.message}`);
                });
                process.exit(1);
            }
            throw error;
        }
    }

    static getInstance(): ConfigService {
        if (!ConfigService.instance) {
            ConfigService.instance = new ConfigService();
        }
        return ConfigService.instance;
    }

    static resetInstance(): void {
        ConfigService.instance = null;
    }

    get nodeEnv(): 'development' | 'production' | 'test' {
        return this.config.NODE_ENV;
    }

    get isProduction(): boolean {
        return this.config.NODE_ENV === 'production';
    }

    get isDevelopment(): boolean {
        return this.config.NODE_ENV === 'development';
    }

    get isTest(): boolean {
        return this.config.NODE_ENV === 'test';
    }

    get port(): number {
        return this.config.PORT;
    }

    get corsOrigin(): string {
        return this.config.CORS_ORIGIN;
    }

    get databaseUrl(): string {
        return this.config.DATABASE_URL;
    }

    get logLevel(): String {
        return this.config.LOG_LEVEL;
    }

    get npm_package_version(): String {
        return this.config.PNPM_PACKAGE_VERSION;
    }
}
