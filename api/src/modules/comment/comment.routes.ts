import { Hono } from 'hono';
import { AppEnv } from '@platform/http/types';
import { CommentController } from './comment.controller';
import { AuthMiddleware } from '@platform/http/middleware';
import {
    createCommentSchema,
    updateCommentSchema,
    commentIdSchema,
    postIdParamSchema,
    articleIdParamSchema,
} from './comment.validator';
import { validate } from '@shared/utils';

export function createCommentRoutes(
    controller: CommentController,
    authMiddleware: AuthMiddleware,
): Hono<AppEnv> {
    const router = new Hono<AppEnv>();
    const sessionMiddleware = authMiddleware.validateUserSession;

    router.get('/:id', validate('param', commentIdSchema), controller.getComment);
    router.get('/post/:postId', validate('param', postIdParamSchema), controller.getPostComments);
    router.get(
        '/article/:articleId',
        validate('param', articleIdParamSchema),
        controller.getArticleComments,
    );
    router.get('/:id/replies', validate('param', commentIdSchema), controller.getReplies);

    router.post(
        '/',
        sessionMiddleware,
        validate('json', createCommentSchema),
        controller.createComment,
    );
    router.patch(
        '/:id',
        sessionMiddleware,
        validate('param', commentIdSchema),
        validate('json', updateCommentSchema),
        controller.updateComment,
    );
    router.delete(
        '/:id',
        sessionMiddleware,
        validate('param', commentIdSchema),
        controller.deleteComment,
    );

    router.post(
        '/:id/like',
        sessionMiddleware,
        validate('param', commentIdSchema),
        controller.toggleLike,
    );
    router.post(
        '/:id/bookmark',
        sessionMiddleware,
        validate('param', commentIdSchema),
        controller.toggleBookmark,
    );

    return router;
}
