import * as z from 'zod';

export const createCommentSchema = z
    .object({
        content: z
            .string()
            .min(1, 'Comment cannot be empty')
            .max(500, 'Comment cannot exceed 500 characters'),
        postId: z.number().int().positive().optional(),
        articleId: z.number().int().positive().optional(),
        parentId: z.number().int().positive().optional(),
    })
    .refine((data) => data.postId || data.articleId || data.parentId, {
        message: 'Comment must belong to a post, an article, or be a reply to another comment',
        path: ['postId', 'articleId', 'parentId'],
    });

export const updateCommentSchema = z.object({
    content: z
        .string()
        .min(1, 'Comment cannot be empty')
        .max(500, 'Comment cannot exceed 500 characters'),
});

export const commentIdSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export const postIdParamSchema = z.object({
    postId: z.coerce.number().int().positive(),
});

export const articleIdParamSchema = z.object({
    articleId: z.coerce.number().int().positive(),
});

export type CreateCommentSchema = z.infer<typeof createCommentSchema>;
export type UpdateCommentSchema = z.infer<typeof updateCommentSchema>;
export type CommentIdSchema = z.infer<typeof commentIdSchema>;
export type PostIdParamSchema = z.infer<typeof postIdParamSchema>;
export type ArticleIdParamSchema = z.infer<typeof articleIdParamSchema>;
