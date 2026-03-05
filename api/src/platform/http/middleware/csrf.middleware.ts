import { csrf } from 'hono/csrf';

export const csrfMiddleware = csrf({
    origin: ['https://', 'https://'],
});
