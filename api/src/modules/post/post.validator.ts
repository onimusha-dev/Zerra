import * as z from 'zod';

export const createPostSchema = z.object({
    content: z.string().min(1, 'Content cannot be empty').max(100000, 'Content is too long'),
    published: z
        .preprocess((val) => val === 'true' || val === true, z.boolean())
        .optional()
        .default(false),
    media: z.any().optional(),
});

export type CreatePostSchema = z.infer<typeof createPostSchema>;

export const updatePostSchema = z
    .object({
        content: z.string().min(1, 'Content cannot be empty').max(100000, 'Content is too long'),
        published: z.preprocess((val) => val === 'true' || val === true, z.boolean()),
        media: z.any(),
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

export const paginationQuerySchema = z.object({
    limit: z.coerce.number().int().positive().default(10),
    cursor: z.coerce.number().int().positive().optional(),
    offset: z.coerce.number().int().nonnegative().optional(),
});

export type PaginationQuerySchema = z.infer<typeof paginationQuerySchema>;
