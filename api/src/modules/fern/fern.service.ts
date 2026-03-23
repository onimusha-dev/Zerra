import { OllamaService } from '@platform/ai';
import { GeminiService } from '@platform/ai/gemini.service';
import { PromptSchema } from './fern.validator';
import { LoggerService } from '@platform/logger/logger.service';
import { FernRepository } from './fern.repository';
import { OllamaModels, GeminiModels } from '@shared/types';

interface IMessage {
    userPrompt: string;
    aiResponse: string;
    reasoning: string | null;
    duration: number | null;
    createdAt: Date;
}

export class FernService {
    private ollamaService: OllamaService;
    private geminiService: GeminiService;
    private fernRepository: FernRepository;
    private logger: LoggerService;

    constructor(
        logger: LoggerService,
        fernRepository: FernRepository,
        ollamaService: OllamaService,
        geminiService: GeminiService,
    ) {
        this.logger = logger;
        this.fernRepository = fernRepository;
        this.ollamaService = ollamaService;
        this.geminiService = geminiService;
    }

    private getAiService(model: string): OllamaService | GeminiService {
        if (model.toLowerCase().includes('gemini')) {
            return this.geminiService;
        }
        return this.ollamaService;
    }

    sendMessage = async (
        body: PromptSchema,
        userId: number,
        chatId: string,
        isTemporary: boolean,
    ) => {
        const { prompt, model, reasoning } = body;
        let sessionId = chatId;
        let session = null;
        let chatHistory: { role: string; content: string }[] = [];

        if (sessionId && sessionId !== 'new' && sessionId !== 'null') {
            session = await this.fernRepository.findSession(sessionId);
            if (session) {
                const history = await this.fernRepository.getSessionMessages(sessionId);
                const recentHistory = history.slice(-10);
                for (const msg of recentHistory) {
                    chatHistory.push({ role: 'user', content: msg.userPrompt });
                    chatHistory.push({ role: 'assistant', content: msg.aiResponse });
                }
            }
        }

        const aiService = this.getAiService(model as string);

        if (!session && !isTemporary) {
            session = await this.fernRepository.createChatSession(userId);
            sessionId = session.id;

            aiService
                .runAgent(
                    `Generate a short, maximum 4 to 12 words title summarizing this prompt: "${prompt}". Only output the title string, without any quotes, prefaces, or extra text.`,
                    model as any,
                    false,
                    'fern',
                    [],
                )
                .then(async (res) => {
                    const titleMsg = res.messages[res.messages.length - 1];
                    if (titleMsg && titleMsg.content) {
                        let title = titleMsg.content as string;
                        title = title.replace(/["']/g, '').trim();
                        if (title) {
                            await this.fernRepository.renameSession(sessionId, title);
                        }
                    }
                })
                .catch((err) => {
                    this.logger.error('Failed to generate session title', err);
                });
        }

        if (isTemporary) {
            const response = await aiService.runAgent(
                prompt,
                model as any,
                reasoning ?? false,
                'fern',
                chatHistory,
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

        const response = await aiService.runAgent(
            prompt,
            model as any,
            reasoning ?? false,
            'fern',
            chatHistory,
        );
        const lastMessage = response.messages[response.messages.length - 1];

        const aiText = lastMessage.content as string;
        const aiReasoning =
            (lastMessage.additional_kwargs?.reasoning_content as string) || undefined;

        const usage = lastMessage.usage_metadata;
        const resMeta = lastMessage.response_metadata || {};

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

    streamMessage = async (
        body: PromptSchema,
        userId: number,
        chatId: string,
        isTemporary: boolean,
        streamHelper: {
            writeSSE: (args: {
                event: string;
                data: string;
                id?: string;
                retry?: number;
            }) => Promise<void>;
        },
    ) => {
        const { prompt, model, reasoning } = body;
        let sessionId = chatId;

        // Create or find session and load history
        let session = null;
        let chatHistory: { role: string; content: string }[] = [];

        if (!isTemporary) {
            if (sessionId && sessionId !== 'new' && sessionId !== 'null') {
                session = await this.fernRepository.findSession(sessionId);
                if (session) {
                    const history = await this.fernRepository.getSessionMessages(sessionId);
                    const recentHistory = history.slice(-10);
                    for (const msg of recentHistory) {
                        chatHistory.push({ role: 'user', content: msg.userPrompt });
                        chatHistory.push({ role: 'assistant', content: msg.aiResponse });
                    }
                }
            }
            if (!session) {
                session = await this.fernRepository.createChatSession(userId);
                sessionId = session.id;

                const aiService = this.getAiService(model as string);
                aiService
                    .runAgent(
                        `Generate a short, maximum 4 to 10 words title summarizing this prompt: "${prompt}". Only output the title string, without any quotes, prefaces, or extra text.`,
                        model as any,
                        false,
                        'fern',
                        [],
                    )
                    .then(async (res) => {
                        const titleMsg = res.messages[res.messages.length - 1];
                        if (titleMsg && titleMsg.content) {
                            let title = titleMsg.content as string;
                            title = title.replace(/["']/g, '').trim();
                            if (title) {
                                await this.fernRepository.renameSession(sessionId, title);
                            }
                        }
                    })
                    .catch((err) => {
                        this.logger.error('Failed to generate session title', err);
                    });
            }
            await streamHelper.writeSSE({ event: 'session', data: sessionId });
        }

        const aiService = this.getAiService(model as string);

        const stream = await aiService.streamAgent(
            prompt,
            model as any,
            reasoning ?? false,
            'fern',
            chatHistory,
        );

        let finalContent = '';
        let finalReasoning = '';
        let metadata: any = null;
        let usage: any = null;

        for await (const s of stream) {
            if (s.event === 'on_chat_model_stream') {
                const chunk = s.data.chunk;
                if (chunk.content) {
                    finalContent += chunk.content;
                    await streamHelper.writeSSE({
                        event: 'content',
                        data: JSON.stringify(chunk.content),
                    });
                }
                if (chunk.additional_kwargs?.reasoning_content) {
                    finalReasoning += chunk.additional_kwargs.reasoning_content;
                    await streamHelper.writeSSE({
                        event: 'reasoning',
                        data: JSON.stringify(chunk.additional_kwargs.reasoning_content),
                    });
                }
            } else if (s.event === 'on_chat_model_end') {
                if (s.data.output?.response_metadata) {
                    metadata = s.data.output.response_metadata;
                }
                if (s.data.output?.usage_metadata) {
                    usage = s.data.output.usage_metadata;
                }
            }
        }

        if (!isTemporary) {
            await this.fernRepository.saveMessage({
                sessionId: sessionId,
                role: 'user',
                userPrompt: prompt,
                aiResponse: finalContent,
                reasoning: finalReasoning || undefined,
                promptTokens: usage?.input_tokens,
                completionTokens: usage?.output_tokens,
                totalTokens: usage?.total_tokens,
                totalDuration: metadata?.total_duration
                    ? BigInt(metadata.total_duration)
                    : undefined,
                loadDuration: metadata?.load_duration ? BigInt(metadata.load_duration) : undefined,
                promptEvalCount: metadata?.prompt_eval_count,
                promptEvalDuration: metadata?.prompt_eval_duration
                    ? BigInt(metadata.prompt_eval_duration)
                    : undefined,
                evalCount: metadata?.eval_count,
                evalDuration: metadata?.eval_duration ? BigInt(metadata.eval_duration) : undefined,
                metadata: metadata || {},
            });
        }

        await streamHelper.writeSSE({
            event: 'done',
            data: JSON.stringify({
                duration: metadata?.total_duration ? Number(metadata.total_duration) : undefined,
            }),
        });
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

    askDeeply = async (prompt: string, model: string = 'lfm2.5-thinking:1.2b') => {
        const aiService = this.getAiService(model);
        return aiService.think(prompt);
    };
}
