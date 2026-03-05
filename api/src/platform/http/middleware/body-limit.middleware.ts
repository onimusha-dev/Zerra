import { Context, Next } from 'hono';

/**
 *
 * @param limit max json size in KiloBytes
 * @returns
 */
export const bodyLimit =
    (limit = 10 * 1024 * 1024) =>
    async (ctx: Context, next: Next) => {
        const size = Number(ctx.req.header('content-length') || 0);

        if (size > limit) {
            return ctx.text('Payload too large', 413);
        }

        await next();
    };
