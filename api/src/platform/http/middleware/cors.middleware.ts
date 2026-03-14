import { cors } from 'hono/cors';
import { ConfigService } from '@platform/config';

export const createCorsMiddleware = (config: ConfigService) => {
    return cors({
        origin: (origin) => {
            // In development, we can be more permissive if explicitly requested,
            // but usually we want to allow the defined CORS_ORIGIN or the request origin if it matches.
            if (config.isDevelopment && origin?.startsWith('http://localhost')) {
                return origin;
            }

            // Allow defined origin from config
            const allowedOrigin = config.corsOrigin;
            if (allowedOrigin === '*' || allowedOrigin === origin) {
                return allowedOrigin;
            }

            return allowedOrigin;
        },
        allowHeaders: [
            'Content-Type',
            'Authorization',
            'X-Custom-Header',
            'Upgrade-Insecure-Requests',
            'Accept',
            'Origin',
        ],
        allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'OPTIONS', 'DELETE'],
        exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
        maxAge: 600,
        credentials: true,
    });
};
