import { cors } from 'hono/cors';

export const corsMiddleware = cors({
    origin: (origin) => origin,
    allowHeaders: ['Content-Type', 'Authorization', 'X-Custom-Header', 'Upgrade-Insecure-Requests'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'OPTIONS', 'DELETE'],
    exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
    maxAge: 600,
    credentials: true,
});
