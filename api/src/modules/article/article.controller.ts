import { TypedContext } from '@platform/http/types';
import { ArticleService } from './article.service';
import {
    CreateArticleSchema,
    UpdateArticleSchema,
    ArticleIdSchema,
    ArticleUserIdSchema,
} from './article.validator';
import { ApiResponse } from '@shared/json';

export class ArticleController {
    constructor(private readonly articleService: ArticleService) {}

    getAllArticles = async (c: TypedContext<any>) => {
        const articles = await this.articleService.getAllArticles();
        return c.json(ApiResponse.success(articles), 200);
    };

    getArticle = async (c: TypedContext<any, ArticleIdSchema>) => {
        const { id } = c.req.valid('param');
        const article = await this.articleService.getArticleById(id);
        return c.json(ApiResponse.success(article), 200);
    };

    createArticle = async (c: TypedContext<CreateArticleSchema>) => {
        const user = c.get('user');
        const body = c.req.valid('json');
        const article = await this.articleService.createArticle(user.id, body);
        return c.json(ApiResponse.success(article, 'Article created successfully'), 201);
    };

    updateArticle = async (c: TypedContext<UpdateArticleSchema, ArticleIdSchema>) => {
        const user = c.get('user');
        const { id } = c.req.valid('param');
        const body = c.req.valid('json');
        const updatedArticle = await this.articleService.updateArticle(id, user.id, body);
        return c.json(ApiResponse.success(updatedArticle, 'Article updated successfully'), 200);
    };

    deleteArticle = async (c: TypedContext<any, ArticleIdSchema>) => {
        const user = c.get('user');
        const { id } = c.req.valid('param');
        const result = await this.articleService.deleteArticle(id, user.id);
        return c.json(ApiResponse.success(result, 'Article deleted successfully'), 200);
    };

    getUserArticles = async (c: TypedContext<any, ArticleUserIdSchema>) => {
        const { userId } = c.req.valid('param');
        const articles = await this.articleService.getUserArticles(userId);
        return c.json(ApiResponse.success(articles), 200);
    };

    toggleLike = async (c: TypedContext<any, ArticleIdSchema>) => {
        const user = c.get('user');
        const { id } = c.req.valid('param');
        const result = await this.articleService.toggleLike(user.id, id);
        return c.json(ApiResponse.success(result, 'Article like toggled'), 200);
    };

    toggleBookmark = async (c: TypedContext<any, ArticleIdSchema>) => {
        const user = c.get('user');
        const { id } = c.req.valid('param');
        const result = await this.articleService.toggleBookmark(user.id, id);
        return c.json(ApiResponse.success(result, 'Article bookmark toggled'), 200);
    };
}
