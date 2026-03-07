import { Context, Next } from 'hono';
import * as z from 'zod';

/**
 * Create validation middleware from a Zod schema
 */
export function validate(schema: ZodSchema) {
    return async (ctx: Context, next: Next): Promise<void> => {
        const result = schema.safeParse(ctx.request.body);

        if (!result.success) {
            const fields: Record<string, string[]> = {};
            for (const issue of result.error.issues) {
                const path = issue.path.join('.');
                if (!fields[path]) fields[path] = [];
                fields[path].push(issue.message);
            }
            throw new ValidationError('Validation failed', fields);
        }

        ctx.request.body = result.data;
        await next();
    };
}

export function validateQuery(schema: ZodSchema) {
    return async (ctx: Context, next: Next): Promise<void> => {
        const result = schema.safeParse(ctx.query);

        if (!result.success) {
            const fields: Record<string, string[]> = {};
            for (const issue of result.error.issues) {
                const path = issue.path.join('.');
                if (!fields[path]) fields[path] = [];
                fields[path].push(issue.message);
            }
            throw new ValidationError('Invalid query parameters', fields);
        }

        await next();
    };
}

export function validateParams(schema: ZodSchema) {
    return async (ctx: Context, next: Next): Promise<void> => {
        const result = schema.safeParse(ctx.params);

        if (!result.success) {
            const fields: Record<string, string[]> = {};
            for (const issue of result.error.issues) {
                const path = issue.path.join('.');
                if (!fields[path]) fields[path] = [];
                fields[path].push(issue.message);
            }
            throw new ValidationError('Invalid path parameters', fields);
        }

        ctx.params = result.data;
        await next();
    };
}
