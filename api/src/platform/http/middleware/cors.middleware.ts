import { cors } from 'hono/cors';
import { ConfigService } from '@platform/config';

export const createCorsMiddleware = (config: ConfigService) => {
    return cors({
        origin: (origin) => {
            const allowedOrigins = [
                'https://zerra-nine.vercel.app',
                ...config.corsOrigin.split(',').map((o) => o.trim()),
            ];

            if (config.isDevelopment) {
                allowedOrigins.push(
                    'http://localhost:3000',
                    'http://127.0.0.1:3000',
                    'http://localhost:5173',
                    'http://localhost:9000',
                );
            }

            if (allowedOrigins.includes('*')) return '*';
            if (origin && allowedOrigins.includes(origin)) return origin;

            // Default to the first allowed origin if no match but valid
            return allowedOrigins[0];
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
