import 'dotenv/config';

import { LoggerService } from '@platform/logger/logger.service';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client/extension';

export class DatabaseService {
    private static instance: DatabaseService | null = null;
    private readonly prismaClint: PrismaClient;
    private isConnected: boolean = false;

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

    resetInstance(): void {
        DatabaseService.instance = null;
    }

    get prisma() {
        return this.prismaClint;
    }

    async connect(): Promise<void> {
        if (this.connected) return;
        try {
            this.prismaClint.$connect();
            this.isConnected = true;
            this.logger.info('Database connected successfully.');
        } catch (error) {
            this.logger.error('Failed to connect to Database', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        if (!this.connected) return;
        try {
            this.prismaClint.$disconnect();
            this.isConnected = false;
        } catch (error) {
            this.logger.error('Error disconnecting from database', error);
            throw error;
        }
    }

    get connected() {
        return this.isConnected;
    }

    async healthCheck(): Promise<{ status: 'up' | 'down'; delayMs?: Number; error?: String }> {
        const start = Date.now();
        try {
            await this.prismaClint.$runCommandRaw({ ping: 1 });
            return {
                status: 'up',
                delayMs: Date.now() - start,
            };
        } catch (error) {
            const err = error as String;
            return {
                status: 'down',
                error: err,
            };
        }
    }

    /**
     * Executes a transaction with the given function.
     * @param fn The function to execute within the transaction.
     * @returns The result of the function.
     */
    async transaction<T>(fn: (tx: PrismaClient) => Promise<T>): Promise<T> {
        const result = this.prismaClint.$transaction(
            fn as Parameters<typeof this.prismaClint.$transaction>[0],
        );
        return result;
    }
}
