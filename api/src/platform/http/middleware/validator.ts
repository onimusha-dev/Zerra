import { Context, Next } from 'hono';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '@shared/json/apiError';

/**
 * Validate request body, query, or params using a Zod schema
 *
 * @param target - 'json', 'query', or 'param'
 * @param schema - Zod schema to validate against
 */
export const validate = (target: 'json' | 'query' | 'param', schema: ZodSchema) => {
    return async (c: Context, next: Next) => {
        let data: any;
        try {
            if (target === 'json') {
                // Handle empty or invalid JSON bodies gracefully
                data = await c.req.json().catch(() => ({}));
            } else if (target === 'query') {
                data = c.req.query();
            } else if (target === 'param') {
                data = c.req.param();
            }

            const result = await schema.safeParseAsync(data);

            if (!result.success) {
                const fields: Record<string, string[]> = {};
                for (const issue of result.error.issues) {
                    const path = issue.path.join('.');
                    if (!fields[path]) fields[path] = [];
                    fields[path].push(issue.message);
                }
                throw new ValidationError(`Invalid request ${target}`, fields);
            }

            // Overwrite or store the validated data
            // Note: Hono's req.json() can't be easily overwritten for downstream
            // but we can pass it through context if needed.
            // For now, we just validate.

            await next();
        } catch (error) {
            if (error instanceof ZodError) {
                const fields: Record<string, string[]> = {};
                for (const issue of error.issues) {
                    const path = issue.path.join('.');
                    if (!fields[path]) fields[path] = [];
                    fields[path].push(issue.message);
                }
                throw new ValidationError(`Invalid request ${target}`, fields);
            }
            throw error;
        }
    };
};
