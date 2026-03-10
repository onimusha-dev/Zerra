import { DatabaseService } from '@platform/database';
import { CreateArticleSchema, UpdateArticleSchema } from './article.validator';

export class ArticleRepository {
    constructor(private readonly db: DatabaseService) {}

    get article() {
        return this.db.prisma.article;
    }

    get like() {
        return this.db.prisma.like;
    }

    get bookmark() {
        return this.db.prisma.bookmark;
    }

    async findAll() {
        return this.article.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true,
                    },
                },
            },
            orderBy: {
                id: 'desc',
            },
        });
    }

    async findById(id: number) {
        return this.article.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true,
                    },
                },
            },
        });
    }

    async createArticle(userId: number, data: CreateArticleSchema) {
        return this.article.create({
            data: {
                ...data,
                userId,
            },
        });
    }

    async updateArticle(id: number, data: UpdateArticleSchema) {
        return this.article.update({
            where: { id },
            data,
        });
    }

    async deleteArticle(id: number) {
        return this.article.delete({
            where: { id },
        });
    }

    async findByUserId(userId: number) {
        return this.article.findMany({
            where: { userId },
            orderBy: {
                id: 'desc',
            },
        });
    }

    async findLike(userId: number, articleId: number) {
        return this.like.findUnique({
            where: { userId_articleId: { userId, articleId } },
        });
    }

    async addLike(userId: number, articleId: number) {
        return this.like.create({
            data: { userId, articleId },
        });
    }

    async removeLike(id: number) {
        return this.like.delete({
            where: { id },
        });
    }

    async findBookmark(userId: number, articleId: number) {
        return this.bookmark.findUnique({
            where: { userId_articleId: { userId, articleId } },
        });
    }

    async addBookmark(userId: number, articleId: number) {
        return this.bookmark.create({
            data: { userId, articleId },
        });
    }

    async removeBookmark(id: number) {
        return this.bookmark.delete({
            where: { id },
        });
    }
}
