import { LoggerService } from '@platform/logger/logger.service';
import { ArticleRepository } from './articles.repository';
import { CreateArticleSchema, UpdateArticleSchema } from './articles.validator';
import { AuthenticationError, ForbiddenError, NotFoundError } from '@shared/json';
import { UsersService } from '@modules/users/users.service';

export class ArticleService {
    constructor(
        private readonly articleRepository: ArticleRepository,
        private readonly userService: UsersService,
        private readonly logger: LoggerService,
    ) {}

    private async checkUserStatus(userId: number) {
        const user = await this.userService.getUserById(userId);
        if (!user) {
            throw new NotFoundError('User');
        }
        if (user.isUserBanned) {
            throw new ForbiddenError('Your account is banned. You cannot perform this action.');
        }
        return user;
    }

    async getAllArticles() {
        return this.articleRepository.findAll();
    }

    async getArticleById(id: number) {
        const article = await this.articleRepository.findById(id);
        if (!article) {
            throw new NotFoundError('Article');
        }
        return article;
    }

    async createArticle(userId: number, data: CreateArticleSchema) {
        await this.checkUserStatus(userId);
        const article = await this.articleRepository.createArticle(userId, data);
        this.logger.info('Article created successfully', { articleId: article.id, userId });
        return article;
    }

    async updateArticle(articleId: number, userId: number, data: UpdateArticleSchema) {
        await this.checkUserStatus(userId);
        const article = await this.articleRepository.findById(articleId);
        if (!article) {
            throw new NotFoundError('Article');
        }

        if (article.userId !== userId) {
            throw new AuthenticationError('Unauthorized to update this article');
        }

        const updatedArticle = await this.articleRepository.updateArticle(articleId, data);
        this.logger.info('Article updated successfully', { articleId, userId });
        return updatedArticle;
    }

    async deleteArticle(articleId: number, userId: number) {
        await this.checkUserStatus(userId);
        const article = await this.articleRepository.findById(articleId);
        if (!article) {
            throw new NotFoundError('Article');
        }

        if (article.userId !== userId) {
            throw new AuthenticationError('Unauthorized to delete this article');
        }

        const deletedArticle = await this.articleRepository.deleteArticle(articleId);
        this.logger.info('Article deleted successfully', { articleId, userId });
        return deletedArticle;
    }

    async getUserArticles(userId: number) {
        return this.articleRepository.findByUserId(userId);
    }
}
