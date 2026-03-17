import { LoggerService } from '@platform/logger/logger.service';
import { PostRepository } from './post.repository';
import { CreatePostSchema, UpdatePostSchema } from './post.validator';
import { AuthenticationError, ForbiddenError, NotFoundError } from '@shared/json';
import { UserService } from '@modules/user/user.service';
import { MediaService } from '@platform/media/media.service';

export class PostService {
    constructor(
        private readonly postRepository: PostRepository,
        private readonly userService: UserService,
        private readonly logger: LoggerService,
        private readonly mediaService: MediaService,
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

    async getAllPosts(currentUserId?: number) {
        const posts = await this.postRepository.findAll(currentUserId);
        return posts.map((post) => ({
            ...post,
            liked: currentUserId ? (post as any).likes?.length > 0 : false,
            bookmarked: currentUserId ? (post as any).bookmarks?.length > 0 : false,
            likes: undefined,
            bookmarks: undefined,
        }));
    }

    async getPostById(id: number, currentUserId?: number) {
        const post = await this.postRepository.findById(id, currentUserId);
        if (!post) {
            throw new NotFoundError('Post');
        }
        return {
            ...post,
            liked: currentUserId ? (post as any).likes?.length > 0 : false,
            bookmarked: currentUserId ? (post as any).bookmarks?.length > 0 : false,
            likes: undefined,
            bookmarks: undefined,
        };
    }

    async createPost(authorId: number, data: CreatePostSchema, file?: File) {
        const user = await this.checkAuthorStatus(authorId);

        if (!user.isVerified && data.content.length > 500) {
            throw new ForbiddenError('Unverified users can only post up to 500 characters.');
        }

        let mediaUrl: string | undefined = undefined;
        if (file) {
            mediaUrl = await this.mediaService.upload(file, 'post');
        } else if (typeof data.media === 'string' && data.media.trim().length > 0) {
            mediaUrl = data.media;
        }

        const postData = {
            content: data.content,
            published: data.published ?? false,
            media: mediaUrl || null,
        };

        const post = await this.postRepository.createPost(authorId, postData as any);
        this.logger.info('Post created successfully', { postId: post.id, authorId });
        return post;
    }

    async updatePost(postId: number, authorId: number, data: UpdatePostSchema) {
        const user = await this.checkAuthorStatus(authorId);

        if (data.content && !user.isVerified && data.content.length > 500) {
            throw new ForbiddenError('Unverified users can only post up to 500 characters.');
        }
        const post = await this.postRepository.findById(postId);
        if (!post) {
            throw new NotFoundError('Post');
        }
        if (post.authorId !== authorId) {
            throw new AuthenticationError('Unauthorized to update this post');
        }
        const updates: any = {};
        if (data.content !== undefined) updates.content = data.content;
        if (data.published !== undefined) updates.published = data.published;
        if (data.media !== undefined) updates.media = data.media;

        const updatedPost = await this.postRepository.updatePost(postId, updates);
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

    async getAuthorPosts(authorId: number, limit: number, cursor?: number, currentUserId?: number) {
        const posts = await this.postRepository.findByAuthorId(
            authorId,
            limit,
            cursor,
            currentUserId,
        );
        return posts.map((post) => ({
            ...post,
            liked: currentUserId ? (post as any).likes?.length > 0 : false,
            bookmarked: currentUserId ? (post as any).bookmarks?.length > 0 : false,
            likes: undefined,
            bookmarks: undefined,
        }));
    }

    async toggleLike(userId: number, postId: number) {
        await this.getPostById(postId);
        const existingLike = await this.postRepository.findLike(userId, postId);
        if (existingLike) {
            await this.postRepository.removeLike(existingLike.id);
            this.logger.info('Post unlike successful', { postId, userId });
            return { liked: false };
        }
        await this.postRepository.addLike(userId, postId);
        this.logger.info('Post like successful', { postId, userId });
        return { liked: true };
    }

    async toggleBookmark(userId: number, postId: number) {
        await this.getPostById(postId);
        const existingBookmark = await this.postRepository.findBookmark(userId, postId);
        if (existingBookmark) {
            await this.postRepository.removeBookmark(existingBookmark.id);
            this.logger.info('Post bookmark removal successful', { postId, userId });
            return { bookmarked: false };
        }
        await this.postRepository.addBookmark(userId, postId);
        this.logger.info('Post bookmark successful', { postId, userId });
        return { bookmarked: true };
    }

    async getPostsByRange(limit: number, cursor?: number, offset?: number, currentUserId?: number) {
        const posts = await this.postRepository.getPostsByRange(
            limit,
            cursor,
            offset,
            currentUserId,
        );
        return posts.map((post: any) => ({
            ...post,
            liked: currentUserId ? (post as any).likes?.length > 0 : false,
            bookmarked: currentUserId ? (post as any).bookmarks?.length > 0 : false,
            likes: undefined,
            bookmarks: undefined,
        }));
    }
}
