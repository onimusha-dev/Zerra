import { Hono } from 'hono';
import { AppEnv } from '@platform/http/types';
import { ArticleController } from './articles.controller';
import { AuthMiddleware } from '@platform/http/middleware';
import {
    createArticleSchema,
    updateArticleSchema,
    articleIdSchema,
    userIdSchema,
} from './articles.validator';
import { validate } from '@shared/utils';

/**
 * @param controller ArticleController
 * @param authMiddleware AuthMiddleware
 * @returns Hono<AppEnv>
 */
export function createArticleRoutes(
    controller: ArticleController,
    authMiddleware: AuthMiddleware,
): Hono<AppEnv> {
    const router = new Hono<AppEnv>();
    const sessionMiddleware = authMiddleware.validateUserSession;

    router.get('/', controller.getAllArticles);
    router.get('/:id', validate('param', articleIdSchema), controller.getArticle);
    router.get('/user/:userId', validate('param', userIdSchema), controller.getUserArticles);

    router.post(
        '/',
        sessionMiddleware,
        validate('json', createArticleSchema),
        controller.createArticle,
    );
    router.patch(
        '/:id',
        sessionMiddleware,
        validate('param', articleIdSchema),
        validate('json', updateArticleSchema),
        controller.updateArticle,
    );
    router.delete(
        '/:id',
        sessionMiddleware,
        validate('param', articleIdSchema),
        controller.deleteArticle,
    );

    return router;
}
