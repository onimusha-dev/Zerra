import { Hono } from 'hono';
import { AppEnv } from '@platform/http/types';
import { PostController } from './posts.controller';
import { AuthMiddleware } from '@platform/http/middleware';
import {
    createPostSchema,
    updatePostSchema,
    postIdSchema,
    authorIdSchema,
} from './posts.validator';
import { validate } from '@shared/utils';

/**
 * @param controller PostController
 * @param authMiddleware AuthMiddleware
 * @returns Hono<AppEnv>
 */
export function createPostRoutes(
    controller: PostController,
    authMiddleware: AuthMiddleware,
): Hono<AppEnv> {
    const router = new Hono<AppEnv>();
    const sessionMiddleware = authMiddleware.validateUserSession;

    router.get('/', controller.getAllPosts);
    router.get('/:id', validate('param', postIdSchema), controller.getPost);
    router.get('/author/:authorId', validate('param', authorIdSchema), controller.getAuthorPosts);

    router.post('/', sessionMiddleware, validate('json', createPostSchema), controller.createPost);
    router.patch(
        '/:id',
        sessionMiddleware,
        validate('param', postIdSchema),
        validate('json', updatePostSchema),
        controller.updatePost,
    );
    router.delete(
        '/:id',
        sessionMiddleware,
        validate('param', postIdSchema),
        controller.deletePost,
    );

    return router;
}
