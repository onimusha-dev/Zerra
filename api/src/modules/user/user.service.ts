import { LoggerService } from '@platform/logger/logger.service';
import { UserRepository } from './user.repository';
import { MediaService } from '@platform/media/media.service';
import { hashString, verifyHash } from '@shared/utils/auth';
import { IUser, IUpdateUserProfile } from '@shared/types';
import { AuthenticationError, ConflictError, NotFoundError, ForbiddenError } from '@shared/json';

/**
 * @TODO - remove sensetive info form the returned object
 *       - set proper returned type
 */
export class UserService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly logger: LoggerService,
        private readonly mediaService: MediaService,
    ) {}

    private stripSensitiveData(user: any) {
        const { password, _count, ...safeUser } = user;
        const flattenedUser = { ...safeUser };
        if (_count) {
            flattenedUser.followersCount = _count.followers;
            flattenedUser.followingCount = _count.following;
            flattenedUser.likesCount = _count.likes;
            flattenedUser.postsCount = _count.posts;
            flattenedUser.articlesCount = _count.articles;
        }
        return flattenedUser;
    }

    async getUserById(id: number): Promise<IUser> {
        const user = await this.userRepository.findUserById(id);
        if (!user) {
            throw new NotFoundError('User');
        }
        return this.stripSensitiveData(user) as IUser;
    }

    async getProfile(id: number, viewerId?: number): Promise<any> {
        const user = await this.userRepository.findUserById(id);
        if (!user) {
            throw new NotFoundError('User');
        }

        let isFollowing = false;
        if (viewerId && viewerId !== id) {
            isFollowing = await this.userRepository.isFollowing(viewerId, id);
        }

        const safeUser = this.stripSensitiveData(user);
        return { ...safeUser, isFollowing };
    }

    async getProfileByUsername(username: string, viewerId?: number): Promise<any> {
        const user = await this.userRepository.findUserByUsername(username);
        if (!user) {
            throw new NotFoundError('User');
        }

        let isFollowing = false;
        if (viewerId && viewerId !== user.id) {
            isFollowing = await this.userRepository.isFollowing(viewerId, user.id);
        }

        const safeUser = this.stripSensitiveData(user);
        return { ...safeUser, isFollowing };
    }

    async updateProfile(
        id: number,
        profile: IUpdateUserProfile,
        files?: { avatar?: File; banner?: File },
    ) {
        const user = await this.userRepository.findUserById(id);
        if (!user) {
            throw new NotFoundError('User');
        }

        const updates: any = { ...profile };

        // 1. Handle Avatar upload if provided
        if (files?.avatar) {
            updates.avatar = await this.mediaService.upload(files.avatar, 'avatar');
            // Cleanup old avatar
            if (user.avatar && !user.avatar.startsWith('http')) {
                await this.mediaService.remove(user.avatar);
            }
        }

        // 2. Handle Banner upload if provided
        if (files?.banner) {
            updates.banner = await this.mediaService.upload(files.banner, 'banner');
            // Cleanup old banner
            if (user.banner && !user.banner.startsWith('http')) {
                await this.mediaService.remove(user.banner);
            }
        }

        const updatedUser = await this.userRepository.updateUserProfile(id, updates);
        this.logger.info('Profile updated successfully', { userId: id });
        return this.stripSensitiveData(updatedUser);
    }

    async updateAvatar(userId: number, file: File) {
        const user = await this.userRepository.findUserById(userId);
        if (!user) throw new NotFoundError('User');

        const avatarUrl = await this.mediaService.upload(file, 'avatar');

        // Optionally delete old avatar if it exists and is local
        if (user.avatar && !user.avatar.startsWith('http')) {
            await this.mediaService.remove(user.avatar);
        }

        const updatedUser = await this.userRepository.updateUserProfile(userId, {
            avatar: avatarUrl,
        });
        this.logger.info('Avatar updated successfully', { userId });
        return this.stripSensitiveData(updatedUser);
    }

    async updateBanner(userId: number, file: File) {
        const user = await this.userRepository.findUserById(userId);
        if (!user) throw new NotFoundError('User');

        const bannerUrl = await this.mediaService.upload(file, 'banner');

        if (user.banner && !user.banner.startsWith('http')) {
            await this.mediaService.remove(user.banner);
        }

        const updatedUser = await this.userRepository.updateUserProfile(userId, {
            banner: bannerUrl,
        });
        this.logger.info('Banner updated successfully', { userId });
        return this.stripSensitiveData(updatedUser);
    }

    async updatePassword(id: number, oldPassword: string, newPassword: string) {
        const user = await this.userRepository.findUserById(id);
        if (!user) {
            throw new NotFoundError('User');
        }
        const isPasswordValid = await verifyHash(user.password, oldPassword);
        if (!isPasswordValid) {
            throw new AuthenticationError('Invalid password');
        }
        const hashedNewPassword = await hashString(newPassword);
        const updatedUser = await this.userRepository.updatePassword(id, hashedNewPassword);
        this.logger.info('Password updated successfully', { userId: id });
        return this.stripSensitiveData(updatedUser);
    }

    async updateEmail(id: number, email: string, password: string) {
        const user = await this.userRepository.findUserById(id);
        if (!user) {
            throw new NotFoundError('User');
        }
        if (email === user.email) {
            throw new ConflictError('Email is already set');
        }
        const isEmailExist = await this.userRepository.findUserByEmail(email);
        if (isEmailExist) {
            throw new ConflictError('Email already exists');
        }
        const isPasswordValid = await verifyHash(user.password, password);
        if (!isPasswordValid) {
            throw new AuthenticationError('Invalid password');
        }
        const updatedUser = await this.userRepository.updateUserEmail(id, email);
        this.logger.info('Email updated successfully', { userId: id, email });
        return this.stripSensitiveData(updatedUser);
    }

    /// @TODO: for 2fa user needs to pass password
    ///      and we will provide ways - 1. email, 2. authenticator app, 3. recovery codes
    async updateTwoFactorEnabled(id: number, password: string, twoFactorEnabled: boolean) {
        const user = await this.userRepository.findUserById(id);
        if (!user) {
            throw new NotFoundError('User');
        }
        const isPasswordValid = await verifyHash(user.password, password);
        if (!isPasswordValid) {
            throw new AuthenticationError('Invalid password');
        }
        const updatedUser = await this.userRepository.updateTwoFactorEnabled(id, twoFactorEnabled);
        this.logger.info('Two factor enabled updated successfully', {
            userId: id,
            twoFactorEnabled,
        });
        return this.stripSensitiveData(updatedUser);
    }

    async deleteUser(id: number, password: string) {
        const user = await this.userRepository.findUserById(id);
        if (!user) {
            throw new NotFoundError('User');
        }
        const isPasswordValid = await verifyHash(user.password, password);
        if (!isPasswordValid) {
            throw new AuthenticationError('Invalid password');
        }
        const deletedUser = await this.userRepository.deleteUser(id);
        this.logger.info('User deleted successfully', { userId: id });
        return this.stripSensitiveData(deletedUser);
    }

    async followUser(followerId: number, followingId: number) {
        if (followerId === followingId) {
            throw new ConflictError('You cannot follow yourself');
        }

        const followingUser = await this.userRepository.findUserById(followingId);
        if (!followingUser) {
            throw new NotFoundError('User to follow');
        }

        if (followingUser.isUserBanned) {
            throw new ForbiddenError('This user is banned');
        }

        const isAlreadyFollowing = await this.userRepository.isFollowing(followerId, followingId);
        if (isAlreadyFollowing) {
            throw new ConflictError('You are already following this user');
        }

        await this.userRepository.followUser(followerId, followingId);
        this.logger.info('User followed successfully', { followerId, followingId });
        return { success: true };
    }

    async unfollowUser(followerId: number, followingId: number) {
        const isFollowing = await this.userRepository.isFollowing(followerId, followingId);
        if (!isFollowing) {
            throw new NotFoundError('Follow relationship not found');
        }

        await this.userRepository.unfollowUser(followerId, followingId);
        this.logger.info('User unfollowed successfully', { followerId, followingId });
        return { success: true };
    }

    async getFollowers(userId: number, viewerId?: number) {
        const followers = await this.userRepository.getFollowers(userId);
        const users = followers.map((f) => f.follower);

        if (!viewerId) return users;

        return Promise.all(
            users.map(async (u: any) => ({
                ...u,
                isFollowing: await this.userRepository.isFollowing(viewerId, u.id),
            })),
        );
    }

    async getFollowing(userId: number, viewerId?: number) {
        const following = await this.userRepository.getFollowing(userId);
        const users = following.map((f) => f.following);

        if (!viewerId) return users;

        return Promise.all(
            users.map(async (u: any) => ({
                ...u,
                isFollowing: await this.userRepository.isFollowing(viewerId, u.id),
            })),
        );
    }

    async getUserBookmarks(userId: number) {
        const bookmarks = await this.userRepository.getBookmarks(userId);
        return bookmarks
            .map((b) => {
                if (b.post) {
                    return {
                        type: 'post',
                        data: {
                            ...b.post,
                            bookmarked: true,
                            liked: false, // Default or fetch if needed
                        },
                    };
                }
                if (b.article) {
                    return {
                        type: 'article',
                        data: {
                            ...b.article,
                            bookmarked: true,
                            liked: false,
                        },
                    };
                }
                return null;
            })
            .filter(Boolean);
    }

    async getUserLikes(userId: number, limit: number, cursor?: number, currentUserId?: number) {
        const likes = await this.userRepository.getLikes(userId, limit, cursor, currentUserId);
        return likes
            .map((l) => {
                if (l.post) {
                    return {
                        likeId: l.id,
                        type: 'post',
                        data: {
                            ...l.post,
                            liked: currentUserId
                                ? (l.post as any).likes?.length > 0
                                : userId === currentUserId,
                            bookmarked: currentUserId
                                ? (l.post as any).bookmarks?.length > 0
                                : false,
                            likes: undefined,
                            bookmarks: undefined,
                        },
                    };
                }
                if (l.article) {
                    return {
                        likeId: l.id,
                        type: 'article',
                        data: {
                            ...l.article,
                            liked: currentUserId
                                ? (l.article as any).likes?.length > 0
                                : userId === currentUserId,
                            bookmarked: currentUserId
                                ? (l.article as any).bookmarks?.length > 0
                                : false,
                            likes: undefined,
                            bookmarks: undefined,
                        },
                    };
                }
                return null;
            })
            .filter(Boolean);
    }
}
