import { TypedContext } from '@platform/http/types';
import { PostService } from './post.service';
import { CreatePostSchema, UpdatePostSchema, PostIdSchema, AuthorIdSchema } from './post.validator';
import { ApiResponse } from '@shared/json';

export class PostController {
    constructor(private readonly postService: PostService) {}

    getAllPosts = async (c: TypedContext<any>) => {
        const user = c.get('user');
        const posts = await this.postService.getAllPosts(user?.id);
        return c.json(ApiResponse.success(posts), 200);
    };

    getPost = async (c: TypedContext<any, PostIdSchema>) => {
        const user = c.get('user');
        const { id } = c.req.valid('param');
        const post = await this.postService.getPostById(id, user?.id);
        return c.json(ApiResponse.success(post), 200);
    };

    createPost = async (c: TypedContext<any, any, any, CreatePostSchema>) => {
        const user = c.get('user');
        const data = c.req.valid('form');

        const mediaFile = data.media instanceof File ? data.media : undefined;
        const postData = { ...data };
        if (mediaFile) delete postData.media;

        const post = await this.postService.createPost(
            user.id,
            postData as CreatePostSchema,
            mediaFile,
        );
        return c.json(ApiResponse.success(post, 'Post created successfully'), 201);
    };

    updatePost = async (c: TypedContext<UpdatePostSchema, PostIdSchema>) => {
        const user = c.get('user');
        const { id } = c.req.valid('param');
        const body = c.req.valid('json');
        const updatedPost = await this.postService.updatePost(id, user.id, body);
        return c.json(ApiResponse.success(updatedPost, 'Post updated successfully'), 200);
    };

    deletePost = async (c: TypedContext<any, PostIdSchema>) => {
        const user = c.get('user');
        const { id } = c.req.valid('param');
        const result = await this.postService.deletePost(id, user.id);
        return c.json(ApiResponse.success(result, 'Post deleted successfully'), 200);
    };

    getAuthorPosts = async (c: TypedContext<any, AuthorIdSchema>) => {
        const user = c.get('user');
        const { authorId } = c.req.valid('param');
        const posts = await this.postService.getAuthorPosts(authorId, user?.id);
        return c.json(ApiResponse.success(posts), 200);
    };

    toggleLike = async (c: TypedContext<any, PostIdSchema>) => {
        const user = c.get('user');
        const { id } = c.req.valid('param');
        const result = await this.postService.toggleLike(user.id, id);
        return c.json(ApiResponse.success(result, 'Post like toggled'), 200);
    };

    toggleBookmark = async (c: TypedContext<any, PostIdSchema>) => {
        const user = c.get('user');
        const { id } = c.req.valid('param');
        const result = await this.postService.toggleBookmark(user.id, id);
        return c.json(ApiResponse.success(result, 'Post bookmark toggled'), 200);
    };
}
