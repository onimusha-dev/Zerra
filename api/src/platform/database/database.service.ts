import { PrismaClient } from '@/generated/prisma';
import { LoggerService } from '@platform/logger/logger.service';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

/**
 * @module DatabaseService
 * @description Singleton wrapper around the Prisma client.
 *
 * Responsibilities:
 *  - Bootstrapping the PrismaClient with the pg adapter and query logging
 *  - Tracking connection state via `isConnected`
 *  - Exposing a `healthCheck()` for the readiness/health endpoints
 *  - Providing a `transaction()` helper so callers never touch the client directly
 *
 * Usage:
 *  ```ts
 *  const db = DatabaseService.getInstance(logger);
 *  await db.connect();
 *  ```
 */
export class DatabaseService {
    private static instance: DatabaseService | null = null;
    private readonly prismaClint: PrismaClient;
    private connected: boolean = false;

    private constructor(private readonly logger: LoggerService) {
        const connectionString = `${process.env.DATABASE_URL}`;
        const adapter = new PrismaPg({ connectionString });
        this.prismaClint = new PrismaClient({
            adapter,
            log: [
                { level: 'query', emit: 'event' },
                { level: 'error', emit: 'event' },
                { level: 'warn', emit: 'event' },
            ],
        });
    }

    static getInstance(logger: LoggerService): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService(logger);
        }
        return DatabaseService.instance;
    }

    /**
     * @WARNING Clears the singleton — intended for testing only.
     *          Do NOT call this in production code.
     */
    resetInstance(): void {
        DatabaseService.instance = null;
    }

    async connect(): Promise<void> {
        if (this.connected) return;
        try {
            await this.prismaClint.$connect();
            this.connected = true;
            this.logger.info('Database connected successfully.');
        } catch (error) {
            this.logger.error('Failed to connect to Database', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        if (!this.connected) return;
        try {
            await this.prismaClint.$disconnect();
            this.connected = false;
        } catch (error) {
            this.logger.error('Error disconnecting from database', error);
            throw error;
        }
    }

    get prisma() {
        return this.prismaClint;
    }

    get isConnected(): boolean {
        return this.isConnected;
    }

    async healthCheck(): Promise<{ status: 'up' | 'down'; delayMs?: number; error?: string }> {
        const start = Date.now();
        try {
            await this.prismaClint.$queryRaw`SELECT 1`;
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

    /**
     * Executes a transaction with the given function.
     * @param fn The function to execute within the transaction.
     * @returns The result of the function.
     */
    async transaction<T>(fn: (tx: PrismaClient) => Promise<T>): Promise<T> {
        return this.prismaClint.$transaction(fn as never) as Promise<T>;
    }
}
