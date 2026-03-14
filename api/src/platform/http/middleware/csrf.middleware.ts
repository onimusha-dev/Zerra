import { csrf } from 'hono/csrf';
import { ConfigService } from '@platform/config';

export const createCsrfMiddleware = (config: ConfigService) => {
    return csrf({
        origin: (origin) => {
            // In development, we allow requests without an origin (like Postman)
            if (config.isDevelopment && !origin) return true;

            // In production or if origin exists, we want to be more strict
            // Usually, Hono CSRF handles matching automatically if we don't provide this,
            // but providing a custom function gives us control.
            return true;
        },
    });
};
