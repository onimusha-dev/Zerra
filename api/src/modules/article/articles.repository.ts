import { DatabaseService } from '@platform/database';
import { CreateArticleSchema, UpdateArticleSchema } from './articles.validator';

export class ArticleRepository {
    constructor(private readonly db: DatabaseService) {}

    get article() {
        return this.db.prisma.articles;
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
}
