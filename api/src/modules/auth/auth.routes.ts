import { Hono } from 'hono';

import { AuthController } from './auth.controller';

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

    router.post('/register', controller.register);
    router.post('/login', controller.login);
    router.post('/logout', controller.logout);

    router.post('/forgot-password', controller.forgotPassword);
    router.post('/reset-password', controller.resetPassword);

    router.post('/refresh-token', controller.rotateTokens);

    router.post('/verify-email', controller.verifyEmail);

    return router;
}
