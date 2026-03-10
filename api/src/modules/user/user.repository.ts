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
                    },
                },
            },
        });
    }

    async findUserById(id: number) {
        return this.user.findUnique({
            where: { id },
        });
    }

    async findUserByEmail(email: string) {
        return this.user.findUnique({
            where: { email },
        });
    }

    async findUserByUsername(username: string) {
        return this.user.findUnique({
            where: { username },
        });
    }

    async createUser(data: RegisterSchema) {
        return this.user.create({
            data,
        });
    }

    async updateUserProfile(id: number, profile: IUpdateUserProfile) {
        return this.user.update({
            where: { id },
            data: profile,
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
}
