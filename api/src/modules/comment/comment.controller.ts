import { TypedContext } from '@platform/http/types';
import { CommentService } from './comment.service';
import {
    CreateCommentSchema,
    UpdateCommentSchema,
    CommentIdSchema,
    PostIdParamSchema,
    ArticleIdParamSchema,
} from './comment.validator';
import { ApiResponse } from '@shared/json';

export class CommentController {
    constructor(private readonly service: CommentService) {}

    createComment = async (c: TypedContext<CreateCommentSchema>) => {
        const user = c.get('user');
        const body = c.req.valid('json');
        const comment = await this.service.createComment(user.id, body);
        return c.json(ApiResponse.success(comment, 'Comment added'), 201);
    };

    getComment = async (c: TypedContext<any, CommentIdSchema>) => {
        const { id } = c.req.valid('param');
        const comment = await this.service.getComment(id);
        return c.json(ApiResponse.success(comment), 200);
    };

    updateComment = async (c: TypedContext<UpdateCommentSchema, CommentIdSchema>) => {
        const user = c.get('user');
        const { id } = c.req.valid('param');
        const body = c.req.valid('json');
        const updated = await this.service.updateComment(user.id, id, body);
        return c.json(ApiResponse.success(updated, 'Comment updated'), 200);
    };

    deleteComment = async (c: TypedContext<any, CommentIdSchema>) => {
        const user = c.get('user');
        const { id } = c.req.valid('param');
        await this.service.deleteComment(user.id, id);
        return c.json(ApiResponse.success(null, 'Comment deleted'), 200);
    };

    getPostComments = async (c: TypedContext<any, PostIdParamSchema>) => {
        const { postId } = c.req.valid('param');
        const comments = await this.service.getPostComments(postId);
        return c.json(ApiResponse.success(comments), 200);
    };

    getArticleComments = async (c: TypedContext<any, ArticleIdParamSchema>) => {
        const { articleId } = c.req.valid('param');
        const comments = await this.service.getArticleComments(articleId);
        return c.json(ApiResponse.success(comments), 200);
    };

    getReplies = async (c: TypedContext<any, CommentIdSchema>) => {
        const { id } = c.req.valid('param');
        const replies = await this.service.getReplies(id);
        return c.json(ApiResponse.success(replies), 200);
    };

    toggleLike = async (c: TypedContext<any, CommentIdSchema>) => {
        const user = c.get('user');
        const { id } = c.req.valid('param');
        const result = await this.service.toggleLike(user.id, id);
        return c.json(ApiResponse.success(result, 'Like toggled'), 200);
    };

    toggleBookmark = async (c: TypedContext<any, CommentIdSchema>) => {
        const user = c.get('user');
        const { id } = c.req.valid('param');
        const result = await this.service.toggleBookmark(user.id, id);
        return c.json(ApiResponse.success(result, 'Bookmark toggled'), 200);
    };
}
