import { DatabaseService } from '@platform/database';
import { CreateCommentSchema, UpdateCommentSchema } from './comment.validator';

export class CommentRepository {
    constructor(private readonly db: DatabaseService) {}

    get comment() {
        return this.db.prisma.comment;
    }

    get like() {
        return this.db.prisma.like;
    }

    get bookmark() {
        return this.db.prisma.bookmark;
    }

    async findCommentById(id: number) {
        return this.comment.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true,
                    },
                },
                _count: {
                    select: { likes: true, replies: true },
                },
            },
        });
    }

    async createComment(userId: number, data: CreateCommentSchema) {
        return this.comment.create({
            data: {
                content: data.content,
                authorId: userId,
                postId: data.postId,
                articleId: data.articleId,
                parentId: data.parentId,
            },
        });
    }

    async updateComment(id: number, data: UpdateCommentSchema) {
        return this.comment.update({
            where: { id },
            data,
        });
    }

    async deleteComment(id: number) {
        return this.comment.delete({
            where: { id },
        });
    }

    async getCommentsByPost(postId: number) {
        return this.comment.findMany({
            where: { postId, parentId: null },
            include: {
                author: {
                    select: { id: true, name: true, username: true, avatar: true },
                },
                _count: { select: { likes: true, replies: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getCommentsByArticle(articleId: number) {
        return this.comment.findMany({
            where: { articleId, parentId: null },
            include: {
                author: {
                    select: { id: true, name: true, username: true, avatar: true },
                },
                _count: { select: { likes: true, replies: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getReplies(parentId: number) {
        return this.comment.findMany({
            where: { parentId },
            include: {
                author: {
                    select: { id: true, name: true, username: true, avatar: true },
                },
                _count: { select: { likes: true, replies: true } },
            },
            orderBy: { createdAt: 'asc' },
        });
    }

    // Like logic
    async findLike(userId: number, commentId: number) {
        return this.like.findUnique({
            where: { userId_commentId: { userId, commentId } },
        });
    }

    async addLike(userId: number, commentId: number) {
        return this.like.create({
            data: { userId, commentId },
        });
    }

    async removeLike(id: number) {
        return this.like.delete({
            where: { id },
        });
    }

    async findBookmark(userId: number, commentId: number) {
        return this.bookmark.findUnique({
            where: { userId_commentId: { userId, commentId } },
        });
    }

    async addBookmark(userId: number, commentId: number) {
        return this.bookmark.create({
            data: { userId, commentId },
        });
    }

    async removeBookmark(id: number) {
        return this.bookmark.delete({
            where: { id },
        });
    }
}
