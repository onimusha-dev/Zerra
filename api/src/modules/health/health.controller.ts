import { DatabaseService } from '@platform/database';
import { HTTP_STATUS } from '@shared/constants/httpStatus';
import { ApiResponse } from '@shared/json';
import { Context } from 'hono';
import { ConfigService } from '@platform/config';
import { CacheService } from '@platform/cache';

/**
 * @module HealthController
 * @description Handlers for health-check API endpoints.
 *
 * Three-tier health check pattern:
 *  - GET /health/live  → Liveness:  is the process alive?
 *  - GET /health/ready → Readiness: are all dependencies up?
 *  - GET /health       → Full:      detailed diagnostics snapshot
 */
export class HealthController {
    constructor(
        private readonly db: DatabaseService,
        private readonly cache: CacheService,
        private readonly config: ConfigService,
    ) {}

    /**
     * Liveness check
     *
     * Lightest possible check — used by orchestrators (e.g. Kubernetes) to
     * decide whether to restart the container. If this responds, the process
     * is alive. No dependency checks here by design.
     *
     * @GET /health/live
     */
    liveness = (c: Context): Response => {
        const response = new ApiResponse(
            HTTP_STATUS.OK,
            {
                status: 'alive',
                pid: process.pid,
                node_version: process.version,
                timestamp: Date.now(),
            },
            'Liveness check passed',
        );

        return c.json(response.toJSON(), HTTP_STATUS.OK);
    };

    /**
     * Readiness check
     *
     * Confirms all critical dependencies are reachable. Used by load
     * balancers to decide whether to route traffic to this instance.
     * Returns 503 if any required dependency is down.
     *
     * @GET /health/ready
     */
    readiness = async (c: Context): Promise<Response> => {
        type DepStatus = { status: 'up' | 'down'; latency_ms?: number; error?: string };

        const dependencies: Record<string, DepStatus> = {
            database: { status: 'down' },
            cache: { status: 'down' },
        };

        try {
            const result = await this.db.healthCheck();
            dependencies.database = {
                status: result.status,
                ...(result.status === 'up' && result.delayMs !== undefined
                    ? { latency_ms: Number(result.delayMs) }
                    : { error: String(result.error ?? 'Unknown error') }),
            };
        } catch (err) {
            dependencies.database = {
                status: 'down',
                error: err instanceof Error ? err.message : 'Unknown error',
            };
        }

        try {
            const result = await this.cache.healthCheck();
            dependencies.cache = { status: result.status, latency_ms: result.delayMs };
        } catch (err) {
            dependencies.cache = {
                status: 'down',
                error: err instanceof Error ? err.message : 'Unknown error',
            };
        }

        const isReady = Object.values(dependencies).every((d) => d.status === 'up');
        const statusCode = isReady ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE;

        const response = new ApiResponse(
            statusCode,
            {
                status: isReady ? 'ready' : 'unavailable',
                dependencies,
                timestamp: Date.now(),
            },
            isReady ? 'Service ready' : 'Service unavailable — one or more dependencies are down',
        );

        return c.json(response.toJSON(), statusCode);
    };

    /**
     * Full health status
     *
     * Provides a complete diagnostics snapshot of the running process.
     * Intended for internal dashboards / ops tooling — NOT for load balancers.
     * Includes uptime, memory, runtime, and dependency health with latency.
     *
     * @GET /health
     */
    health = async (c: Context): Promise<Response> => {
        const uptimeSeconds = Math.floor(process.uptime());
        const mem = process.memoryUsage();

        // DB health (best-effort — we still return 200 for informational use)
        let dbHealth: { status: 'up' | 'down'; latency_ms?: number; error?: string } = {
            status: 'down',
        };
        try {
            const result = await this.db.healthCheck();
            dbHealth = {
                status: result.status,
                ...(result.status === 'up' && result.delayMs !== undefined
                    ? { latency_ms: Number(result.delayMs) }
                    : { error: String(result.error ?? 'Unknown error') }),
            };
        } catch (err) {
            dbHealth = {
                status: 'down',
                error: err instanceof Error ? err.message : 'Unknown error',
            };
        }

        let cacheHealth: { status: 'up' | 'down'; latency_ms?: number; error?: string } = {
            status: 'down',
        };
        try {
            const result = await this.cache.healthCheck();
            cacheHealth = {
                status: result.status,
                ...(result.status === 'up' && result.delayMs !== undefined
                    ? { latency_ms: Number(result.delayMs) }
                    : { error: String(result.error ?? 'Unknown error') }),
            };
        } catch (err) {
            cacheHealth = {
                status: 'down',
                error: err instanceof Error ? err.message : 'Unknown error',
            };
        }

        const response = new ApiResponse(
            HTTP_STATUS.OK,
            {
                status: 'healthy',
                service: 'api',
                version: this.config.npm_package_version,
                environment: this.config.nodeEnv,
                process: {
                    pid: process.pid,
                    node_version: process.version,
                    platform: process.platform,
                    arch: process.arch,
                    uptime_sec: uptimeSeconds,
                    uptime_human: formatUptime(uptimeSeconds),
                },
                memory: {
                    heap_used_mb: toMB(mem.heapUsed),
                    heap_total_mb: toMB(mem.heapTotal),
                    rss_mb: toMB(mem.rss),
                    external_mb: toMB(mem.external),
                },
                dependencies: {
                    database: dbHealth,
                    cache: cacheHealth,
                },
                timestamp: Date.now(),
            },
            'Health check passed',
        );

        return c.json(response.toJSON(), HTTP_STATUS.OK);
    };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converts uptime in seconds into a human-readable string.
 * e.g. 3725 → "1h 2m 5s"
 */
function formatUptime(sec: number): string {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return `${h}h ${m}m ${s}s`;
}

/** Converts bytes to megabytes, rounded to 2 decimal places. */
function toMB(bytes: number): number {
    return Math.round((bytes / 1024 / 1024) * 100) / 100;
}
