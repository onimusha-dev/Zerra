import * as z from 'zod';

export const createPostSchema = z.object({
    content: z
        .string()
        .min(1, 'Content cannot be empty')
        .max(500, 'Content cannot exceed 500 characters'),
    published: z.boolean().optional().default(false),
    banner: z.string().url('Banner URL is invalid').optional(),
});

export type CreatePostSchema = z.infer<typeof createPostSchema>;

export const updatePostSchema = z
    .object({
        content: z
            .string()
            .min(1, 'Content cannot be empty')
            .max(500, 'Content cannot exceed 500 characters'),
        published: z.boolean(),
        banner: z.string().url('Banner URL is invalid'),
    })
    .partial();

export type UpdatePostSchema = z.infer<typeof updatePostSchema>;

export const postIdSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export type PostIdSchema = z.infer<typeof postIdSchema>;

export const authorIdSchema = z.object({
    authorId: z.coerce.number().int().positive(),
});

export type AuthorIdSchema = z.infer<typeof authorIdSchema>;
