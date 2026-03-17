import { DatabaseService } from '@platform/database';
import { CreatePostSchema, UpdatePostSchema } from './post.validator';

export class PostRepository {
    constructor(private readonly db: DatabaseService) {}

    get post() {
        return this.db.prisma.post;
    }

    get like() {
        return this.db.prisma.like;
    }

    get bookmark() {
        return this.db.prisma.bookmark;
    }

    async findAll(currentUserId?: number) {
        return this.post.findMany({
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true,
                        isVerified: true,
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                        bookmarks: true,
                    },
                },
                ...(currentUserId
                    ? {
                          likes: {
                              where: { userId: currentUserId },
                              select: { id: true },
                          },
                          bookmarks: {
                              where: { userId: currentUserId },
                              select: { id: true },
                          },
                      }
                    : {}),
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findById(id: number, currentUserId?: number) {
        return this.post.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true,
                        isVerified: true,
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                        bookmarks: true,
                    },
                },
                ...(currentUserId
                    ? {
                          likes: {
                              where: { userId: currentUserId },
                              select: { id: true },
                          },
                          bookmarks: {
                              where: { userId: currentUserId },
                              select: { id: true },
                          },
                      }
                    : {}),
            },
        });
    }

    async createPost(authorId: number, data: CreatePostSchema) {
        return this.post.create({
            data: {
                ...data,
                authorId,
            },
        });
    }

    async updatePost(id: number, data: UpdatePostSchema) {
        return this.post.update({
            where: { id },
            data,
        });
    }

    async deletePost(id: number) {
        return this.post.delete({
            where: { id },
        });
    }

    async findByAuthorId(authorId: number, limit: number, cursor?: number, currentUserId?: number) {
        return this.post.findMany({
            where: { authorId },
            take: limit,
            ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true,
                        isVerified: true,
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                        bookmarks: true,
                    },
                },
                ...(currentUserId
                    ? {
                          likes: {
                              where: { userId: currentUserId },
                              select: { id: true },
                          },
                          bookmarks: {
                              where: { userId: currentUserId },
                              select: { id: true },
                          },
                      }
                    : {}),
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async getPostsByRange(limit: number, cursor?: number, offset?: number, currentUserId?: number) {
        return this.post.findMany({
            take: limit,
            ...(cursor ? { skip: 1, cursor: { id: cursor } } : offset ? { skip: offset } : {}),
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true,
                        isVerified: true,
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                        bookmarks: true,
                    },
                },
                ...(currentUserId
                    ? {
                          likes: {
                              where: { userId: currentUserId },
                              select: { id: true },
                          },
                          bookmarks: {
                              where: { userId: currentUserId },
                              select: { id: true },
                          },
                      }
                    : {}),
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findLike(userId: number, postId: number) {
        return this.like.findUnique({
            where: { userId_postId: { userId, postId } },
        });
    }

    async addLike(userId: number, postId: number) {
        return this.like.create({
            data: { userId, postId },
        });
    }

    async removeLike(id: number) {
        return this.like.delete({
            where: { id },
        });
    }

    async findBookmark(userId: number, postId: number) {
        return this.bookmark.findUnique({
            where: { userId_postId: { userId, postId } },
        });
    }

    async addBookmark(userId: number, postId: number) {
        return this.bookmark.create({
            data: { userId, postId },
        });
    }

    async removeBookmark(id: number) {
        return this.bookmark.delete({
            where: { id },
        });
    }
}
