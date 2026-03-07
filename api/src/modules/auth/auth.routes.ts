import { Hono } from 'hono';
import { AuthController } from './auth.controller';
import { validate } from '@platform/http/middleware';
import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    verifyEmailSchema,
} from './auth.validator';

/**
 *
 * @param controller AuthController
 * @returns Hono
 *
 *  @POST /login         -> liveness
 *  @POST /register   -> readiness
 *  @POST /logout -> dependency checks
 *  @POST /forgot-password -> dependency checks
 *  @POST /reset-password -> dependency checks
 *  @POST /verify-email -> dependency checks
 *
 */
export function createAuthRoutes(controller: AuthController): Hono {
    const router = new Hono();

    router.post('/register', validate('json', registerSchema), controller.register);
    router.post('/login', validate('json', loginSchema), controller.login);
    router.post('/logout', controller.logout);

    router.post(
        '/forgot-password',
        validate('json', forgotPasswordSchema),
        controller.forgotPassword,
    );
    router.post('/reset-password', validate('json', resetPasswordSchema), controller.resetPassword);

    router.post('/refresh-token', controller.rotateTokens);

    router.post('/verify-email', validate('json', verifyEmailSchema), controller.verifyEmail);

    return router;
}
