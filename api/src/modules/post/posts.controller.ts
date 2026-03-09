import { JSONContext } from '@platform/http/types';
import { PostService } from './posts.service';
import { CreatePostSchema, UpdatePostSchema } from './posts.validator';
import { ApiResponse } from '@shared/json';

export class PostController {
    constructor(private readonly postService: PostService) {}

    getAllPosts = async (c: JSONContext<any>) => {
        const posts = await this.postService.getAllPosts();
        return c.json(ApiResponse.success(posts), 200);
    };

    getPost = async (c: JSONContext<any>) => {
        const { id } = c.req.valid('param' as any);
        const post = await this.postService.getPostById(id);
        return c.json(ApiResponse.success(post), 200);
    };

    createPost = async (c: JSONContext<CreatePostSchema>) => {
        const user = c.get('user');
        const body = c.req.valid('json');
        const post = await this.postService.createPost(user.id, body);
        return c.json(ApiResponse.success(post, 'Post created successfully'), 201);
    };

    updatePost = async (c: JSONContext<UpdatePostSchema>) => {
        const user = c.get('user');
        const { id } = c.req.valid('param' as any);
        const body = c.req.valid('json');
        const updatedPost = await this.postService.updatePost(id, user.id, body);
        return c.json(ApiResponse.success(updatedPost, 'Post updated successfully'), 200);
    };

    deletePost = async (c: JSONContext<any>) => {
        const user = c.get('user');
        const { id } = c.req.valid('param' as any);
        const result = await this.postService.deletePost(id, user.id);
        return c.json(ApiResponse.success(result, 'Post deleted successfully'), 200);
    };

    getAuthorPosts = async (c: JSONContext<any>) => {
        const { authorId } = c.req.valid('param' as any);
        const posts = await this.postService.getAuthorPosts(authorId);
        return c.json(ApiResponse.success(posts), 200);
    };
}
