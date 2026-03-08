import { ConfigService } from '@platform/config';
import { LoggerService } from '@platform/logger/logger.service';
import { createClient } from 'redis';

export class CacheService {
    private static instance: CacheService | null = null;
    private client: ReturnType<typeof createClient>;
    private readonly keyPrefix: string;
    private ready: boolean = false;

    private constructor(
        private config: ConfigService,
        private logger: LoggerService,
    ) {
        this.keyPrefix = 'zerra';
        this.client = createClient({
            socket: {
                host: config.redis_host,
                port: config.redis_port,
                reconnectStrategy: (retries) => {
                    if (retries > 3) {
                        return new Error('Too many retries.');
                    }
                    return Math.min(retries * 100, 300);
                },
            },
            password: config.redis_password,
            RESP: 3,
            clientSideCache: {
                ttl: 0, // Time-to-live in milliseconds (0 = no expiration)
                maxEntries: 0, // Maximum entries to store (0 = unlimited)
                evictPolicy: 'LRU', // Eviction policy: "LRU" or "FIFO"
            },
        });

        this.client.on('connect', () => {
            this.ready = true;
            this.logger.debug('Redis connected');
        });

        this.client.on('error', (err) => {
            this.ready = false;
            this.logger.error('Redis error', err);
        });

        this.client.on('close', () => {
            this.ready = false;
            this.logger.debug('Redis connection closed');
        });
    }

    static getInstance(config: ConfigService, logger: LoggerService): CacheService {
        if (!CacheService.instance) {
            CacheService.instance = new CacheService(config, logger);
        }
        config;
        return CacheService.instance;
    }

    static resetInstance(): void {
        CacheService.instance = null;
    }

    private prefixKey(key: string): string {
        return `${this.keyPrefix}${key}`;
    }

    get isReady(): boolean {
        return this.ready;
    }

    async connect(): Promise<void> {
        if (!this.ready) {
            await this.client.connect();
            this.ready = true;
        }
        return;
    }

    async disconnect(): Promise<void> {
        if (this.ready) {
            await this.client.quit();
            this.ready = false;
        }
        return;
    }

    async get<T>(key: string): Promise<T | null> {
        if (!this.ready) return null;
        try {
            const data = await this.client.get(this.prefixKey(key));
            return data ? JSON.parse(data) : null;
        } catch (error) {
            this.logger.warn('Cache get error', { key, error });
            return null;
        }
    }

    async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
        if (!this.ready) return false;
        try {
            await this.client.set(this.prefixKey(key), JSON.stringify(value), {
                EX: ttl,
            });
            return true;
        } catch (error) {
            this.logger.warn('Cache set error', { key, error });
            return false;
        }
    }

    async delete(key: string): Promise<boolean> {
        if (!this.ready) return false;
        try {
            await this.client.del(this.prefixKey(key));
            return true;
        } catch (error) {
            this.logger.warn('Cache delete error', { key, error });
            return false;
        }
    }

    async healthCheck(): Promise<{ status: 'up' | 'down'; delayMs?: number; error?: string }> {
        const start = Date.now();
        try {
            await this.client.ping();
            return {
                status: 'up',
                delayMs: Date.now() - start,
            };
        } catch (error) {
            return {
                status: 'down',
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
}
