import { cors } from 'hono/cors';
import { ConfigService } from '@platform/config';

export const createCorsMiddleware = (config: ConfigService) => {
    return cors({
        origin: (origin) => {
            const allowedOrigins = [
                'https://zerra-nine.vercel.app',
                ...config.corsOrigin.split(',').map((o) => o.trim()),
            ];

            // Whitelist common local origins for Docker/Development use
            const localHome = [
                'http://localhost:3000',
                'http://localhost:5000',
                'http://localhost:5173',
                'http://localhost:9000',
                'http://127.0.0.1:3000',
            ];
            localHome.forEach((h) => {
                if (!allowedOrigins.includes(h)) allowedOrigins.push(h);
            });

            if (allowedOrigins.includes('*')) return origin || '*';
            if (origin && allowedOrigins.includes(origin)) return origin;

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
