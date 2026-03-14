import { TokenPayload } from '@shared/utils/auth';
import { Context } from 'hono';

/**
 * Define the environment types for Hono Context
 * This allows us to have type safety for c.set() and c.get()
 */
export type AppEnv = {
    Variables: {
        user: TokenPayload;
    };
};

/**
 * A reusable helper for typing Hono Context with validated inputs.
 *      T: The JSON body schema
 *      P: The Path params schema
 *      Q: The Query string schema
 */
export type TypedContext<T = any, P = any, Q = any, F = any> = Context<
    AppEnv,
    any,
    {
        out: {
            json: T;
            param: P;
            query: Q;
            form: F;
        };
        in: {
            json: any;
            param: any;
            query: any;
            form: any;
        };
    }
>;

// Shorthand helpers for common use cases:
export type JSONContext<T = any> = TypedContext<T, any, any>;
export type ParamContext<P = any> = TypedContext<any, P, any>;
export type QueryContext<Q = any> = TypedContext<any, any, Q>;
