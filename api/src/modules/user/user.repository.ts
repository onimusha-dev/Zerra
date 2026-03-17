import { DatabaseService } from '@platform/database';
import { RegisterSchema } from '../auth/auth.validator';
import { IUpdateUserProfile } from '@shared/types';

export class UserRepository {
    constructor(private readonly db: DatabaseService) {}

    get user() {
        return this.db.prisma.user;
    }

    get follow() {
        return this.db.prisma.follow;
    }

    private get userInclude() {
        return {
            _count: {
                select: {
                    followers: true,
                    following: true,
                    likes: true,
                    posts: true,
                    articles: true,
                },
            },
        };
    }

    async followUser(followerId: number, followingId: number) {
        return this.follow.create({
            data: { followerId, followingId },
        });
    }

    async unfollowUser(followerId: number, followingId: number) {
        return this.follow.delete({
            where: {
                followerId_followingId: { followerId, followingId },
            },
        });
    }

    async isFollowing(followerId: number, followingId: number) {
        const follow = await this.follow.findUnique({
            where: {
                followerId_followingId: { followerId, followingId },
            },
        });
        return !!follow;
    }

    async getFollowersCount(userId: number) {
        return this.follow.count({
            where: { followingId: userId },
        });
    }

    async getFollowingCount(userId: number) {
        return this.follow.count({
            where: { followerId: userId },
        });
    }

    async getFollowers(userId: number) {
        return this.follow.findMany({
            where: { followingId: userId },
            include: {
                follower: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true,
                        bio: true,
                        isVerified: true,
                    },
                },
            },
        });
    }

    async getFollowing(userId: number) {
        return this.follow.findMany({
            where: { followerId: userId },
            include: {
                following: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true,
                        bio: true,
                        isVerified: true,
                    },
                },
            },
        });
    }

    async findUserById(id: number) {
        return this.user.findUnique({
            where: { id },
            include: this.userInclude,
        });
    }

    async findUserByEmail(email: string) {
        return this.user.findUnique({
            where: { email },
            include: this.userInclude,
        });
    }

    async findUserByUsername(username: string) {
        return this.user.findUnique({
            where: { username },
            include: this.userInclude,
        });
    }

    async createUser(data: RegisterSchema) {
        return this.user.create({
            data,
            include: this.userInclude,
        });
    }

    async updateUserProfile(id: number, profile: IUpdateUserProfile) {
        return this.user.update({
            where: { id },
            data: profile,
            include: this.userInclude,
        });
    }

    async updateUserEmail(id: number, email: string) {
        return this.user.update({
            where: { id },
            data: { email },
        });
    }
    async updatePassword(id: number, password: string) {
        return this.user.update({
            where: { id },
            data: { password },
        });
    }

    async updateRefreshToken(id: number, refreshToken: string | null) {
        return this.user.update({
            where: { id },
            data: { refreshToken },
        });
    }

    async updateTwoFactorEnabled(id: number, twoFactorEnabled: boolean) {
        return this.user.update({
            where: { id },
            data: { twoFactorEnabled },
        });
    }

    async deleteUser(id: number) {
        return this.user.delete({
            where: { id },
        });
    }

    async getBookmarks(userId: number) {
        return this.db.prisma.bookmark.findMany({
            where: { userId },
            include: {
                post: {
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
                                comments: true,
                                likes: true,
                                bookmarks: true,
                            },
                        },
                    },
                },
                article: {
                    include: {
                        user: {
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
                                comments: true,
                                likes: true,
                                bookmarks: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getLikes(userId: number, limit: number, cursor?: number, currentUserId?: number) {
        return this.db.prisma.like.findMany({
            where: { userId },
            take: limit,
            ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
            include: {
                post: {
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
                                comments: true,
                                likes: true,
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
                },
                article: {
                    include: {
                        user: {
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
                                comments: true,
                                likes: true,
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
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}
