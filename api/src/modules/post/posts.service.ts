import { LoggerService } from '@platform/logger/logger.service';
import { PostRepository } from './posts.repository';
import { CreatePostSchema, UpdatePostSchema } from './posts.validator';
import { AuthenticationError, ForbiddenError, NotFoundError } from '@shared/json';
import { UsersService } from '@modules/users/users.service';

export class PostService {
    constructor(
        private readonly postRepository: PostRepository,
        private readonly userService: UsersService,
        private readonly logger: LoggerService,
    ) {}

    private async checkAuthorStatus(authorId: number) {
        const user = await this.userService.getUserById(authorId);
        if (!user) {
            throw new NotFoundError('User');
        }
        if (user.isUserBanned) {
            throw new ForbiddenError('Your account is banned. You cannot perform this action.');
        }
        return user;
    }

    async getAllPosts() {
        return this.postRepository.findAll();
    }

    async getPostById(id: number) {
        const post = await this.postRepository.findById(id);
        if (!post) {
            throw new NotFoundError('Post');
        }
        return post;
    }

    async createPost(authorId: number, data: CreatePostSchema) {
        await this.checkAuthorStatus(authorId);
        const post = await this.postRepository.createPost(authorId, data);
        this.logger.info('Post created successfully', { postId: post.id, authorId });
        return post;
    }

    async updatePost(postId: number, authorId: number, data: UpdatePostSchema) {
        await this.checkAuthorStatus(authorId);
        const post = await this.postRepository.findById(postId);
        if (!post) {
            throw new NotFoundError('Post');
        }

        if (post.authorId !== authorId) {
            throw new AuthenticationError('Unauthorized to update this post');
        }

        const updatedPost = await this.postRepository.updatePost(postId, data);
        this.logger.info('Post updated successfully', { postId, authorId });
        return updatedPost;
    }

    async deletePost(postId: number, authorId: number) {
        await this.checkAuthorStatus(authorId);
        const post = await this.postRepository.findById(postId);
        if (!post) {
            throw new NotFoundError('Post');
        }

        if (post.authorId !== authorId) {
            throw new AuthenticationError('Unauthorized to delete this post');
        }

        const deletedPost = await this.postRepository.deletePost(postId);
        this.logger.info('Post deleted successfully', { postId, authorId });
        return deletedPost;
    }

    async getAuthorPosts(authorId: number) {
        return this.postRepository.findByAuthorId(authorId);
    }
}
