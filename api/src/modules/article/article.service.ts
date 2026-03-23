import { LoggerService } from '@platform/logger/logger.service';
import { ArticleRepository } from './article.repository';
import { CreateArticleSchema, UpdateArticleSchema } from './article.validator';
import { AuthenticationError, ForbiddenError, NotFoundError } from '@shared/json';
import { UserService } from '@modules/user/user.service';
import { MediaService } from '@platform/media/media.service';

export class ArticleService {
    constructor(
        private readonly articleRepository: ArticleRepository,
        private readonly userService: UserService,
        private readonly logger: LoggerService,
        private readonly mediaService: MediaService,
    ) {}

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

    async createArticle(userId: number, data: CreateArticleSchema, file?: File) {
        await this.checkUserStatus(userId);

        let bannerUrl: string | null = data.banner;
        if (file) {
            bannerUrl = await this.mediaService.upload(file, 'banner');
        }

        const article = await this.articleRepository.createArticle(userId, {
            ...data,
            banner: bannerUrl,
        });

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

    async getUserArticles(userId: number, limit: number, cursor?: number, currentUserId?: number) {
        const articles = await this.articleRepository.findByUserId(
            userId,
            limit,
            cursor,
            currentUserId,
        );
        return articles.map((article: any) => ({
            ...article,
            liked: currentUserId ? (article as any).likes?.length > 0 : false,
            bookmarked: currentUserId ? (article as any).bookmarks?.length > 0 : false,
            likes: undefined,
            bookmarks: undefined,
        }));
    }

    async toggleLike(userId: number, articleId: number) {
        await this.getArticleById(articleId);
        const existingLike = await this.articleRepository.findLike(userId, articleId);
        if (existingLike) {
            await this.articleRepository.removeLike(existingLike.id);
            this.logger.info('Article unlike successful', { articleId, userId });
            return { liked: false };
        }
        await this.articleRepository.addLike(userId, articleId);
        this.logger.info('Article like successful', { articleId, userId });
        return { liked: true };
    }

    async toggleBookmark(userId: number, articleId: number) {
        await this.getArticleById(articleId);
        const existingBookmark = await this.articleRepository.findBookmark(userId, articleId);
        if (existingBookmark) {
            await this.articleRepository.removeBookmark(existingBookmark.id);
            this.logger.info('Article bookmark removal successful', { articleId, userId });
            return { bookmarked: false };
        }
        await this.articleRepository.addBookmark(userId, articleId);
        this.logger.info('Article bookmark successful', { articleId, userId });
        return { bookmarked: true };
    }

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

    async getArticlesByRange(
        limit: number,
        cursor?: number,
        offset?: number,
        currentUserId?: number,
    ) {
        const articles = await this.articleRepository.getArticlesByRange(
            limit,
            cursor,
            offset,
            currentUserId,
        );
        return articles.map((article: any) => ({
            ...article,
            liked: currentUserId ? (article as any).likes?.length > 0 : false,
            bookmarked: currentUserId ? (article as any).bookmarks?.length > 0 : false,
            likes: undefined,
            bookmarks: undefined,
        }));
    }
}
