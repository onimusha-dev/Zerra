import { JSONContext } from '@platform/http/types';
import { ArticleService } from './articles.service';
import { CreateArticleSchema, UpdateArticleSchema } from './articles.validator';
import { ApiResponse } from '@shared/json';

export class ArticleController {
    constructor(private readonly articleService: ArticleService) {}

    getAllArticles = async (c: JSONContext<any>) => {
        const articles = await this.articleService.getAllArticles();
        return c.json(ApiResponse.success(articles), 200);
    };

    getArticle = async (c: JSONContext<any>) => {
        const { id } = c.req.valid('param' as any);
        const article = await this.articleService.getArticleById(id);
        return c.json(ApiResponse.success(article), 200);
    };

    createArticle = async (c: JSONContext<CreateArticleSchema>) => {
        const user = c.get('user');
        const body = c.req.valid('json');
        const article = await this.articleService.createArticle(user.id, body);
        return c.json(ApiResponse.success(article, 'Article created successfully'), 201);
    };

    updateArticle = async (c: JSONContext<UpdateArticleSchema>) => {
        const user = c.get('user');
        const { id } = c.req.valid('param' as any);
        const body = c.req.valid('json');
        const updatedArticle = await this.articleService.updateArticle(id, user.id, body);
        return c.json(ApiResponse.success(updatedArticle, 'Article updated successfully'), 200);
    };

    deleteArticle = async (c: JSONContext<any>) => {
        const user = c.get('user');
        const { id } = c.req.valid('param' as any);
        const result = await this.articleService.deleteArticle(id, user.id);
        return c.json(ApiResponse.success(result, 'Article deleted successfully'), 200);
    };

    getUserArticles = async (c: JSONContext<any>) => {
        const { userId } = c.req.valid('param' as any);
        const articles = await this.articleService.getUserArticles(userId);
        return c.json(ApiResponse.success(articles), 200);
    };
}
