import { Hono } from 'hono';
import { AppEnv } from '@platform/http/types';
import { UserController } from './user.controller';
import { AuthMiddleware } from '@platform/http/middleware';
import {
    changeEmailSchema,
    changePasswordSchema,
    changeTwoFactorSchema,
    deleteUserSchema,
    userUpdateSchema,
    userIdParamSchema,
} from './user.validator';
import { validate } from '@shared/utils';

/**
 *
 * @param controller UserController
 * @returns Hono<AppEnv>
 *
 */
export function createUserRoutes(
    controller: UserController,
    authMiddleware: AuthMiddleware,
): Hono<AppEnv> {
    const router = new Hono<AppEnv>();
    const middleware = authMiddleware.validateUserSession;

    router.get('/profile/:id', controller.getUser);

    /* @WARNING: Don't to add the auth middleware */
    router.get('/me', middleware, controller.getUser);
    router.patch('/me', middleware, validate('json', userUpdateSchema), controller.updateUser);
    router.delete('/me', middleware, validate('json', deleteUserSchema), controller.deleteUser);

    router.patch(
        '/me/change-password',
        middleware,
        validate('json', changePasswordSchema),
        controller.changePassword,
    );
    router.patch(
        '/me/change-email',
        middleware,
        validate('json', changeEmailSchema),
        controller.changeEmail,
    );
    router.patch(
        '/me/two-factor-authentication',
        middleware,
        validate('json', changeTwoFactorSchema),
        controller.changeTwoFactorAuthentication,
    );

    router.post(
        '/follow/:id',
        middleware,
        validate('param', userIdParamSchema),
        controller.followUser,
    );
    router.post(
        '/unfollow/:id',
        middleware,
        validate('param', userIdParamSchema),
        controller.unfollowUser,
    );
    router.get('/followers/:id?', middleware, controller.getFollowers);
    router.get('/following/:id?', middleware, controller.getFollowing);

    return router;
}
