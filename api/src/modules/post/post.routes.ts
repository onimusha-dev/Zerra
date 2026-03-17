import { Hono } from 'hono';
import { AppEnv } from '@platform/http/types';
import { PostController } from './post.controller';
import { AuthMiddleware } from '@platform/http/middleware';
import {
    createPostSchema,
    updatePostSchema,
    postIdSchema,
    authorIdSchema,
    paginationQuerySchema,
} from './post.validator';
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
    const optionalSession = authMiddleware.optionalUserSession;

    router.get('/', optionalSession, controller.getAllPosts);
    router.get(
        '/for-you',
        optionalSession,
        validate('query', paginationQuerySchema),
        controller.getForYouPosts,
    );
    router.get('/:id', optionalSession, validate('param', postIdSchema), controller.getPost);
    router.get(
        '/author/:authorId',
        optionalSession,
        validate('param', authorIdSchema),
        validate('query', paginationQuerySchema),
        controller.getAuthorPosts,
    );

    router.post('/', sessionMiddleware, validate('form', createPostSchema), controller.createPost);
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

    router.post(
        '/:id/like',
        sessionMiddleware,
        validate('param', postIdSchema),
        controller.toggleLike,
    );
    router.post(
        '/:id/bookmark',
        sessionMiddleware,
        validate('param', postIdSchema),
        controller.toggleBookmark,
    );

    return router;
}
