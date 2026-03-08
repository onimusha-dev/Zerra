import { configDotenv } from 'dotenv';
import z from 'zod';
import { parseDurationToSeconds } from '@shared/utils/time';

configDotenv();

const configSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'trace', 'fatal']).default('debug'),
    PORT: z.string().default('5500').transform(Number),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    CORS_ORIGIN: z.string().default('*'),
    PNPM_PACKAGE_VERSION: z.string().default('1.0.0'),
    REDIS_HOST: z.string().optional().default('localhost'),
    REDIS_PORT: z.string().optional().default('6379').transform(Number),
    REDIS_PASSWORD: z.string().optional(),

    // Authentication Configuration
    ACCESS_TOKEN_SECRET: z.string(),
    ACCESS_TOKEN_EXPIRY: z.string().default('30m'),
    REFRESH_TOKEN_SECRET: z.string(),
    REFRESH_TOKEN_EXPIRY: z.string().default('7d'),

    // Cookie Configuration
    SECURE_COOKIES: z
        .string()
        .toLowerCase()
        .transform((x) => x === 'true')
        .default(false),
    HTTPONLY_COOKIES: z
        .string()
        .toLowerCase()
        .transform((x) => x === 'true')
        .default(true),

    // SMTP Configuration
    SMTPUSER: z.string(),
    SMTPPASS: z.string(),
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

    get logLevel(): string {
        return this.config.LOG_LEVEL;
    }

    get npm_package_version(): string {
        return this.config.PNPM_PACKAGE_VERSION;
    }

    get redis_host(): string {
        return this.config.REDIS_HOST;
    }

    get redis_port(): number {
        return this.config.REDIS_PORT;
    }

    get redis_password(): string | undefined {
        return this.config.REDIS_PASSWORD;
    }

    get access_token_secret(): string {
        return this.config.ACCESS_TOKEN_SECRET;
    }

    // Returns string format for JWT (e.g., "30m")
    get access_token_expiry(): string {
        return this.config.ACCESS_TOKEN_EXPIRY;
    }

    // Returns seconds for Cookies (e.g., 1800)
    get access_token_expiry_seconds(): number {
        return parseDurationToSeconds(this.config.ACCESS_TOKEN_EXPIRY);
    }

    get refresh_token_secret(): string {
        return this.config.REFRESH_TOKEN_SECRET;
    }

    // Returns string format for JWT (e.g., "7d")
    get refresh_token_expiry(): string {
        return this.config.REFRESH_TOKEN_EXPIRY;
    }

    // Returns seconds for Cookies (e.g., 604800)
    get refresh_token_expiry_seconds(): number {
        return parseDurationToSeconds(this.config.REFRESH_TOKEN_EXPIRY);
    }

    get secure_cookies(): boolean {
        return this.config.SECURE_COOKIES;
    }

    get httpOnly_cookies(): boolean {
        return this.config.HTTPONLY_COOKIES;
    }

    get smtpUser(): string {
        return this.config.SMTPUSER;
    }

    get smtpPass(): string {
        return this.config.SMTPPASS;
    }
}

export const config = ConfigService.getInstance();
