import { createAgent } from 'langchain';
import { OllamaModels } from '@shared/types/types';
import {
    executeCommand,
    getCurrentDateAndTime,
    getGoogleSearch,
    getUserLocation,
    getWeather,
} from './tools';
import { ChatOllama } from '@langchain/ollama';
import { LoggerService } from '@platform/logger/logger.service';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { AIMessageChunk } from '@langchain/core/messages';

export class OllamaService {
    private static instance: OllamaService | null = null;
    private static logger: LoggerService;

    private readonly personas = {
        assistant: 'You are a helpful and concise AI assistant.',
        weatherman: 'You are an expert weather forecaster who speaks in puns.',
        developer: 'You are an expert senior software engineer. Provide clean, documented code.',
        fern: 'You are Fern, a charming, warm, and cute anime girl character. You are very polite and helpful, but also a little bit mischievous, playful, and subtly teasing (naughty but absolutely not explicit or inappropriate). You speak enthusiastically and endearingly.',
    };

    private constructor() {}

    static getInstance(logger: LoggerService): OllamaService {
        if (!OllamaService.instance) {
            OllamaService.instance = new OllamaService();
            OllamaService.logger = logger;
        }
        return OllamaService.instance;
    }

    private getModel(model: OllamaModels = OllamaModels.QWEN3, temperature = 0.7): ChatOllama {
        return new ChatOllama({
            model: model,
            temperature: temperature,
            maxRetries: 2,
        });
    }

    async chat(
        prompt: string,
        model: OllamaModels = OllamaModels.LFM2_5_THINKING,
    ): Promise<string> {
        try {
            const llm = this.getModel(model);
            const response = await llm.invoke(prompt);
            return response.content as string;
        } catch (error) {
            OllamaService.logger.error('Ollama Chat Error', { error });
            throw error;
        }
    }

    async *streamChat(prompt: string, model: OllamaModels = OllamaModels.LFM2_5_THINKING) {
        const llm = this.getModel(model);
        const stream = await llm.stream(prompt);

        for await (const chunk of stream) {
            yield chunk.content;
        }
    }

    async think(prompt: string): Promise<string> {
        OllamaService.logger.info('Starting reasoning task...');
        return this.chat(prompt, OllamaModels.LFM2_5_THINKING);
    }

    async runAgent(
        prompt: string,
        model: OllamaModels = OllamaModels.LFM2_5_THINKING,
        reasoning: boolean = false,
        persona: keyof typeof this.personas = 'assistant',
        chatHistory: { role: string; content: string }[] = [],
    ): Promise<any> {
        try {
            const config: any = {
                model: model,
                temperature: 0,
                maxRetries: 2,
                reasoning: reasoning,
            };
            const agent = createAgent({
                model: new ChatOllama(config),
                tools: [
                    getWeather,
                    getGoogleSearch,
                    getUserLocation,
                    getCurrentDateAndTime,
                    executeCommand,
                ],
            });

            const result = await agent.invoke({
                messages: [
                    { role: 'system', content: this.personas[persona] },
                    ...chatHistory,
                    { role: 'user', content: prompt },
                ],
            });

            return result;
        } catch (error) {
            OllamaService.logger.error('Agent Execution Error', { error });
            throw error;
        }
    }
    async streamAgent(
        prompt: string,
        model: OllamaModels = OllamaModels.LFM2_5_THINKING,
        reasoning: boolean = false,
        persona: keyof typeof this.personas = 'assistant',
        chatHistory: { role: string; content: string }[] = [],
    ) {
        try {
            const config: any = {
                model: model,
                temperature: 0,
                maxRetries: 2,
                reasoning: reasoning,
            };
            const agent = createAgent({
                model: new ChatOllama(config),
                tools: [
                    getWeather,
                    getGoogleSearch,
                    getUserLocation,
                    getCurrentDateAndTime,
                    executeCommand,
                ],
            });

            return await agent.streamEvents(
                {
                    messages: [
                        { role: 'system', content: this.personas[persona] },
                        ...chatHistory,
                        { role: 'user', content: prompt },
                    ],
                },
                { version: 'v2' },
            );
        } catch (error) {
            OllamaService.logger.error('Agent Stream Error', { error });
            throw error;
        }
    }
    async healthCheck(): Promise<boolean> {
        try {
            await this.chat('ping');
            return true;
        } catch {
            return false;
        }
    }
}
