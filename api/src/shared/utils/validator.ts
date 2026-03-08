import { zValidator } from '@hono/zod-validator';
import { ValidationError } from '@shared/json';
import { ValidationTargets } from 'hono';
import { z, ZodSchema } from 'zod';

/**
 * @description A custom wrapper around hono's zValidator that throws our standardized ValidationError.
 *              This ensures validation errors are handled by the global error handler consistently.
 *              Generics <T, P> preserve type inference for c.req.valid(target).
 */
export const validate = <T extends ZodSchema, P extends keyof ValidationTargets>(
    target: P,
    schema: T,
) =>
    zValidator(target, schema, (result) => {
        if (!result.success) {
            const fields: Record<string, string[]> = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path.join('.') || 'body';
                if (!fields[path]) fields[path] = [];
                fields[path].push(issue.message);
            });
            throw new ValidationError('Validation failed', fields);
        }
    });
