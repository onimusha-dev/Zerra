import { validate } from '@shared/utils';
import { Hono } from 'hono';
import { chatIdSchema, promptSchema, renameChatSchema } from './fern.validator';
import { FernController } from './fern.controller';
import { AuthMiddleware } from '@platform/http/middleware';

export function createFernRoutes(controller: FernController, authMiddleware: AuthMiddleware) {
    const router = new Hono();

    router.use('*', authMiddleware.validateUserSession);

    router.post(
        '/:chatId/message',
        validate('param', chatIdSchema),
        validate('json', promptSchema),
        controller.sendPrompt,
    );

    router.get('/chats', controller.getAllChats);

    router.get('/:chatId', validate('param', chatIdSchema), controller.getChatMessages);

    router.post(
        '/:chatId/rename',
        validate('param', chatIdSchema),
        validate('json', renameChatSchema),
        controller.renameChat,
    );

    router.delete('/:chatId', validate('param', chatIdSchema), controller.deleteChat);

    return router;
}
