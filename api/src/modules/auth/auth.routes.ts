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
import { validate } from '@shared/utils';

export function createAuthRoutes(
    controller: AuthController,
    authMiddleware: AuthMiddleware,
): Hono<AppEnv> {
    const router = new Hono<AppEnv>();
    const middleware = authMiddleware.validateUserSession;

    router.use('/logout', middleware);
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
