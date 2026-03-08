import { Hono } from 'hono';
import { AuthController } from './auth.controller';
import { AuthMiddleware } from '@platform/http/middleware';
import { AppEnv } from '@platform/http/types';
import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    verifyEmailSchema,
} from './auth.validator';
import { zValidator } from '@hono/zod-validator';

/**
 *
 * @param controller AuthController
 * @returns Hono<AppEnv>
 *
 *  @POST /login         -> liveness
 *  @POST /register   -> readiness
 *  @POST /logout -> dependency checks
 *  @POST /forgot-password -> dependency checks
 *  @POST /reset-password -> dependency checks
 *  @POST /verify-email -> dependency checks
 *
 */
export function createAuthRoutes(
    controller: AuthController,
    authMiddleware: AuthMiddleware,
): Hono<AppEnv> {
    const router = new Hono<AppEnv>();
    const middleware = authMiddleware.validateUserSession;

    router.use('/logout', middleware);
    router.post('/register', zValidator('json', registerSchema), controller.register);
    router.post('/login', zValidator('json', loginSchema), controller.login);
    router.post('/logout', controller.logout);

    router.post(
        '/forgot-password',
        zValidator('json', forgotPasswordSchema),
        controller.forgotPassword,
    );
    router.post(
        '/reset-password',
        zValidator('json', resetPasswordSchema),
        controller.resetPassword,
    );

    router.post('/refresh-token', controller.rotateTokens);

    router.post('/verify-email', zValidator('json', verifyEmailSchema), controller.verifyEmail);

    return router;
}
