import { OllamaService } from '@platform/ai';
import { PromptSchema } from './fern.validator';
import { LoggerService } from '@platform/logger/logger.service';
import { FernRepository } from './fern.repository';
import { OllamaModels } from '@shared/types';

interface IMessage {
    userPrompt: string;
    aiResponse: string;
    reasoning: string | null;
    duration: number | null;
    createdAt: Date;
}

export class FernService {
    private ollamaService: OllamaService;
    private fernRepository: FernRepository;
    private logger: LoggerService;

    constructor(
        logger: LoggerService,
        fernRepository: FernRepository,
        ollamaService: OllamaService,
    ) {
        this.logger = logger;
        this.fernRepository = fernRepository;
        this.ollamaService = ollamaService;
    }

    sendMessage = async (
        body: PromptSchema,
        userId: number,
        chatId: string,
        isTemporary: boolean,
    ) => {
        const { prompt, model, reasoning } = body;
        let sessionId = chatId;

        if (isTemporary) {
            const response = await this.ollamaService.runAgent(
                prompt,
                model as OllamaModels,
                reasoning ?? false,
                'assistant',
            );
            const lastMessage = response.messages[response.messages.length - 1];
            return {
                sessionId,
                content: lastMessage.content,
                reasoning: lastMessage.additional_kwargs?.reasoning_content,
                duration: lastMessage.response_metadata?.total_duration
                    ? Number(lastMessage.response_metadata.total_duration)
                    : undefined,
            };
        }

        const response = await this.ollamaService.runAgent(
            prompt,
            model as OllamaModels,
            reasoning ?? false,
            'assistant',
        );
        const lastMessage = response.messages[response.messages.length - 1];

        const aiText = lastMessage.content as string;
        const aiReasoning =
            (lastMessage.additional_kwargs?.reasoning_content as string) || undefined;

        const usage = lastMessage.usage_metadata;
        const resMeta = lastMessage.response_metadata || {};

        // If it's a new chat, create the session first
        // Also check if the session actually exists in the DB to avoid Foreign Key errors
        let session = null;
        if (sessionId && sessionId !== 'new' && sessionId !== 'null') {
            session = await this.fernRepository.findSession(sessionId);
        }

        if (!session) {
            session = await this.fernRepository.createChatSession(userId);
            sessionId = session.id;
        }

        await this.fernRepository.saveMessage({
            sessionId: sessionId,
            role: 'user',
            userPrompt: prompt,
            aiResponse: aiText,
            reasoning: aiReasoning,
            promptTokens: usage?.input_tokens,
            completionTokens: usage?.output_tokens,
            totalTokens: usage?.total_tokens,
            totalDuration: resMeta.total_duration ? BigInt(resMeta.total_duration) : undefined,
            loadDuration: resMeta.load_duration ? BigInt(resMeta.load_duration) : undefined,
            promptEvalCount: resMeta.prompt_eval_count,
            promptEvalDuration: resMeta.prompt_eval_duration
                ? BigInt(resMeta.prompt_eval_duration)
                : undefined,
            evalCount: resMeta.eval_count,
            evalDuration: resMeta.eval_duration ? BigInt(resMeta.eval_duration) : undefined,
            metadata: lastMessage,
        });

        return {
            sessionId,
            content: aiText,
            reasoning: aiReasoning,
            duration: resMeta.total_duration ? Number(resMeta.total_duration) : undefined,
        };
    };

    getChatMessages = async (chatId: string) => {
        const messages = await this.fernRepository.getSessionMessages(chatId);
        return messages.map((message) => ({
            userPrompt: message.userPrompt,
            aiResponse: message.aiResponse,
            reasoning: message.reasoning,
            duration: message.totalDuration ? Number(message.totalDuration) : null,
            createdAt: message.createdAt,
        }));
    };

    getAllChats = async (userId: number) => {
        return this.fernRepository.getAllSessions(userId);
    };

    renameChat = async (name: string, chatId: string) => {
        return this.fernRepository.renameSession(chatId, name);
    };

    deleteChat = async (chatId: string) => {
        return this.fernRepository.deleteSession(chatId);
    };

    askDeeply = async (prompt: string) => {
        return this.ollamaService.think(prompt);
    };
}
