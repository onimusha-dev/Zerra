import { csrf } from 'hono/csrf';
import { ConfigService } from '@platform/config';

export const createCsrfMiddleware = (config: ConfigService) => {
    return csrf({
        origin: (origin, c) => {
            if (config.isDevelopment && !origin) return true;

            const userAgent = c.req.header('User-Agent');
            if (config.isDevelopment && userAgent?.includes('Postman')) return true;

            if (config.isDevelopment && config.corsOrigin === '*') return true;

            const allowedOrigins = [
                'https://zerra-nine.vercel.app',
                config.appUrl,
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

            return allowedOrigins.includes(origin);
        },
    });
};
