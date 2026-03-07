import { Context, Next } from 'hono';
import type { LoggerService } from '@platform/logger/logger.service';

export function createRequestLogger(logger: LoggerService) {
    return async (c: Context, next: Next): Promise<void> => {
        const start = Date.now();
        const requestId = crypto.randomUUID().slice(0, 8);

        // Set request ID in headers and context
        c.set('requestId', requestId);
        c.header('X-Request-ID', requestId);

        try {
            await next();
        } finally {
            const duration = Date.now() - start;

            // Skip health check logging if successful
            if (c.req.path === '/health' && c.res.status === 200) {
                return;
            }

            logger.logRequest(c.req.method, c.req.path, c.res.status, duration, {
                requestId,
                userAgent: c.req.header('user-agent'),
                // Assuming user middleware sets 'user' in context
                userId: (c.get('user') as any)?.id,
                // Hono IP detection depends on the runtime/adapter
                ip: c.req.header('x-forwarded-for') || 'unknown',
            });
        }
    };
}
