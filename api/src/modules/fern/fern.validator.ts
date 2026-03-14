import * as z from 'zod';

const modelSchema = z.enum([
    'lfm2.5-thinking:1.2b',
    'qwen3:1.7b',
    'qwen3:0.6b',
    'functiongemma:270m',
]);

export const promptSchema = z.object({
    prompt: z.string(),
    model: modelSchema.optional().default('qwen3:0.6b'),
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
