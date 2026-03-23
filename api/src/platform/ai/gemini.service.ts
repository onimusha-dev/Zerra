import { createAgent } from 'langchain';
import { GeminiModels } from '@shared/types/types';
import {
    executeCommand,
    getCurrentDateAndTime,
    getGoogleSearch,
    getUserLocation,
    getWeather,
} from './tools';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { LoggerService } from '@platform/logger/logger.service';
import { ConfigService } from '@platform/config/config.service';
import { fern } from '@shared/constants/ai';

export class GeminiService {
    private static instance: GeminiService | null = null;
    private static logger: LoggerService;
    private config: ConfigService;

    private readonly personas = {
        assistant: 'You are a helpful and concise AI assistant.',
        weatherman: 'You are an expert weather forecaster who speaks in puns.',
        developer: 'You are an expert senior software engineer. Provide clean, documented code.',
        fern,
    };

    private constructor(config: ConfigService) {
        this.config = config;
    }

    static getInstance(logger: LoggerService, config: ConfigService): GeminiService {
        if (!GeminiService.instance) {
            GeminiService.instance = new GeminiService(config);
            GeminiService.logger = logger;
        }
        return GeminiService.instance;
    }

    private getModel(
        model: GeminiModels = GeminiModels.GEMINI_1_5_FLASH,
        temperature = 0.7,
    ): ChatGoogleGenerativeAI {
        return new ChatGoogleGenerativeAI({
            model: model,
            temperature: temperature,
            apiKey: this.config.geminiApiKey || '',
            maxRetries: 2,
        });
    }

    async chat(
        prompt: string,
        model: GeminiModels = GeminiModels.GEMINI_1_5_FLASH,
    ): Promise<string> {
        try {
            const llm = this.getModel(model);
            const response = await llm.invoke(prompt);
            return response.content as string;
        } catch (error) {
            GeminiService.logger.error('Gemini Chat Error', { error });
            throw error;
        }
    }

    async *streamChat(prompt: string, model: GeminiModels = GeminiModels.GEMINI_1_5_FLASH) {
        const llm = this.getModel(model);
        const stream = await llm.stream(prompt);

        for await (const chunk of stream) {
            yield chunk.content;
        }
    }

    async think(prompt: string): Promise<string> {
        GeminiService.logger.info('Starting reasoning task...');
        return this.chat(prompt, GeminiModels.GEMINI_2_0_FLASH); // Using 2.0 flash as a placeholder for reasoning capabilities
    }

    async runAgent(
        prompt: string,
        model: GeminiModels | string = GeminiModels.GEMINI_1_5_FLASH,
        reasoning: boolean = false,
        persona: keyof typeof this.personas = 'assistant',
        chatHistory: { role: string; content: string }[] = [],
    ): Promise<any> {
        try {
            const config: any = {
                model: model,
                temperature: 0,
                maxRetries: 2,
                apiKey: this.config.geminiApiKey || '',
            };
            const agent = createAgent({
                model: new ChatGoogleGenerativeAI(config),
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
            GeminiService.logger.error('Agent Execution Error', { error });
            throw error;
        }
    }

    async streamAgent(
        prompt: string,
        model: GeminiModels | string = GeminiModels.GEMINI_1_5_FLASH,
        reasoning: boolean = false,
        persona: keyof typeof this.personas = 'assistant',
        chatHistory: { role: string; content: string }[] = [],
    ) {
        try {
            const config: any = {
                model: model,
                temperature: 0,
                maxRetries: 2,
                apiKey: this.config.geminiApiKey || '',
            };
            const agent = createAgent({
                model: new ChatGoogleGenerativeAI(config),
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
            GeminiService.logger.error('Agent Stream Error', { error });
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
