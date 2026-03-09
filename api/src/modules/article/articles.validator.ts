import * as z from 'zod';

export const createArticleSchema = z.object({
    title: z
        .string()
        .min(1, 'Title cannot be empty')
        .max(100, 'Title cannot exceed 100 characters'),
    body: z.string().min(1, 'Body cannot be empty'),
    published: z.boolean().optional().default(true),
    enableComments: z.boolean().optional().default(true),
});

export type CreateArticleSchema = z.infer<typeof createArticleSchema>;

export const updateArticleSchema = z
    .object({
        title: z
            .string()
            .min(1, 'Title cannot be empty')
            .max(100, 'Title cannot exceed 100 characters'),
        body: z.string().min(1, 'Body cannot be empty'),
        published: z.boolean(),
        enableComments: z.boolean(),
    })
    .partial();

export type UpdateArticleSchema = z.infer<typeof updateArticleSchema>;

export const articleIdSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export const userIdSchema = z.object({
    userId: z.coerce.number().int().positive(),
});
