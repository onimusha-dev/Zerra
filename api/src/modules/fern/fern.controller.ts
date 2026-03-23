import { streamSSE } from 'hono/streaming';
import { TypedContext } from '@platform/http/types';
import { ChatIdSchema, PromptSchema, RenameChatSchema } from './fern.validator';
import { ApiResponse } from '@shared/json';
import { FernService } from './fern.service';

export class FernController {
    fernService: FernService;

    constructor(fernService: FernService) {
        this.fernService = fernService;
    }

    sendPrompt = async (c: TypedContext<PromptSchema, ChatIdSchema, any, any>) => {
        const body = c.req.valid('json');
        const { chatId } = c.req.valid('param');
        const user = c.get('user');

        const isTemporary = c.req.query('isTemporary') === 'true';

        return streamSSE(c, async (stream) => {
            await this.fernService.streamMessage(body, user.id, chatId, isTemporary, stream);
        });
    };

    getChatMessages = async (c: TypedContext<any, ChatIdSchema, any, any>) => {
        const { chatId } = c.req.valid('param');
        const result = await this.fernService.getChatMessages(chatId);
        return c.json(ApiResponse.success(result), 200);
    };

    getAllChats = async (c: TypedContext<any, any, any, any>) => {
        const user = c.get('user');
        const result = await this.fernService.getAllChats(user.id);
        return c.json(ApiResponse.success(result), 200);
    };

    renameChat = async (c: TypedContext<RenameChatSchema, ChatIdSchema, any, any>) => {
        const { name } = c.req.valid('json');
        const { chatId } = c.req.valid('param');
        const result = await this.fernService.renameChat(name, chatId);
        return c.json(ApiResponse.success(result), 200);
    };

    deleteChat = async (c: TypedContext<any, ChatIdSchema, any, any>) => {
        const { chatId } = c.req.valid('param');
        await this.fernService.deleteChat(chatId);
        return c.json(ApiResponse.success(null, 'Chat deleted'), 200);
    };
}
