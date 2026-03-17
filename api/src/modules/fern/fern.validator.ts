import * as z from 'zod';

const modelSchema = z.enum([
    'lfm2.5-thinking:1.2b',
    'qwen3:1.7b',
    'qwen3:0.6b',
    'functiongemma:270m',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-2.0-flash',
    'gemini-2.5-flash',
]);

export const promptSchema = z.object({
    prompt: z.string(),
    model: z.any().optional().default('qwen3:0.6b'), // Used z.any() to not strictly restrict via validation if more models are added later dynamically or keep it as z.enum

    webSearch: z
        .preprocess((val) => val === 'true' || val === true, z.boolean())
        .default(false)
        .optional(),
    reasoning: z
        .preprocess((val) => val === 'true' || val === true, z.boolean())
        .default(false)
        .optional(),
});

export type PromptSchema = z.infer<typeof promptSchema>;

export const chatIdSchema = z.object({
    chatId: z.string(),
});

export type ChatIdSchema = z.infer<typeof chatIdSchema>;

export const renameChatSchema = z.object({
    name: z.string().max(50, 'Name cannot exceed 50 characters'),
});

export type RenameChatSchema = z.infer<typeof renameChatSchema>;
