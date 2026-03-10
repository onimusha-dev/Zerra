import { LoggerService } from '@platform/logger/logger.service';
import { CommentRepository } from './comment.repository';
import { CreateCommentSchema, UpdateCommentSchema } from './comment.validator';
import { NotFoundError, ForbiddenError } from '@shared/json';

export class CommentService {
    constructor(
        private readonly repository: CommentRepository,
        private readonly logger: LoggerService,
    ) {}

    async createComment(userId: number, data: CreateCommentSchema) {
        const comment = await this.repository.createComment(userId, data);
        this.logger.info('Comment created', { commentId: comment.id, userId });
        return comment;
    }

    async getComment(id: number) {
        const comment = await this.repository.findCommentById(id);
        if (!comment) throw new NotFoundError('Comment');
        return comment;
    }

    async updateComment(userId: number, id: number, data: UpdateCommentSchema) {
        const comment = await this.getComment(id);
        if (comment.authorId !== userId)
            throw new ForbiddenError('You can only update your own comments');

        const updated = await this.repository.updateComment(id, data);
        this.logger.info('Comment updated', { commentId: id, userId });
        return updated;
    }

    async deleteComment(userId: number, id: number) {
        const comment = await this.getComment(id);
        if (comment.authorId !== userId)
            throw new ForbiddenError('You can only delete your own comments');

        await this.repository.deleteComment(id);
        this.logger.info('Comment deleted', { commentId: id, userId });
        return { success: true };
    }

    async getPostComments(postId: number) {
        return this.repository.getCommentsByPost(postId);
    }

    async getArticleComments(articleId: number) {
        return this.repository.getCommentsByArticle(articleId);
    }

    async getReplies(commentId: number) {
        return this.repository.getReplies(commentId);
    }

    async toggleLike(userId: number, commentId: number) {
        await this.getComment(commentId); // Verify exists
        const existingLike = await this.repository.findLike(userId, commentId);
        if (existingLike) {
            await this.repository.removeLike(existingLike.id);
            this.logger.info('Comment unlike successful', { commentId, userId });
            return { liked: false };
        }
        await this.repository.addLike(userId, commentId);
        this.logger.info('Comment like successful', { commentId, userId });
        return { liked: true };
    }

    async toggleBookmark(userId: number, commentId: number) {
        await this.getComment(commentId); // Verify exists
        const existingBookmark = await this.repository.findBookmark(userId, commentId);
        if (existingBookmark) {
            await this.repository.removeBookmark(existingBookmark.id);
            this.logger.info('Comment bookmark removal successful', { commentId, userId });
            return { bookmarked: false };
        }
        await this.repository.addBookmark(userId, commentId);
        this.logger.info('Comment bookmark successful', { commentId, userId });
        return { bookmarked: true };
    }
}
