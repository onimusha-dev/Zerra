import { TypedContext, ParamContext } from '@platform/http/types';
import { CacheService } from '@platform/cache';
import { LoggerService } from '@platform/logger/logger.service';
import { UserService } from './user.service';
import {
    ChangeEmailSchema,
    ChangePasswordSchema,
    ChangeTwoFactorSchema,
    DeleteUserSchema,
    UserUpdateSchema,
    UserIdParamSchema,
    AvatarUpdateSchema,
    BannerUpdateSchema,
} from './user.validator';
import { ApiResponse, MediaError } from '@shared/json';

export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly cache: CacheService,
    ) {}

    getUser = async (c: TypedContext<any, UserIdParamSchema>) => {
        const user = c.get('user');
        const { id: userIdParam } = c.req.param();
        const profile = await this.userService.getProfile(
            userIdParam ? parseInt(userIdParam) : user.id,
            user?.id,
        );
        return c.json(ApiResponse.success(profile), 200);
    };

    getUserByUsername = async (c: any) => {
        const user = c.get('user');
        const username = c.req.param('username');
        const profile = await this.userService.getProfileByUsername(username, user?.id);
        return c.json(ApiResponse.success(profile), 200);
    };

    updateUser = async (c: TypedContext<any, any, any, UserUpdateSchema>) => {
        const user = c.get('user');
        const data = c.req.valid('form');

        const avatarFile = data.avatar instanceof File ? data.avatar : undefined;
        const bannerFile = data.banner instanceof File ? data.banner : undefined;

        const updateData = { ...data };
        if (avatarFile) delete updateData.avatar;
        if (bannerFile) delete updateData.banner;

        const filteredBody = Object.fromEntries(
            Object.entries(updateData).filter(([_, v]) => v !== undefined),
        ) as any;

        const updatedUser = await this.userService.updateProfile(user.id, filteredBody, {
            avatar: avatarFile,
            banner: bannerFile,
        });
        return c.json(ApiResponse.success(updatedUser, 'Profile updated successfully'), 200);
    };

    deleteUser = async (c: TypedContext<DeleteUserSchema>) => {
        const user = c.get('user');
        const { password } = c.req.valid('json');
        const result = await this.userService.deleteUser(user.id, password);
        return c.json(ApiResponse.success(result, 'User deleted successfully'), 200);
    };

    changePassword = async (c: TypedContext<ChangePasswordSchema>) => {
        const user = c.get('user');
        const { oldPassword, newPassword } = c.req.valid('json');
        const updatedUser = await this.userService.updatePassword(
            user.id,
            oldPassword,
            newPassword,
        );
        return c.json(ApiResponse.success(updatedUser, 'Password updated successfully'), 200);
    };

    changeEmail = async (c: TypedContext<ChangeEmailSchema>) => {
        const user = c.get('user');
        const { email, password } = c.req.valid('json');
        const updatedUser = await this.userService.updateEmail(user.id, email, password);
        return c.json(ApiResponse.success(updatedUser, 'Email updated successfully'), 200);
    };

    changeTwoFactorAuthentication = async (c: TypedContext<ChangeTwoFactorSchema>) => {
        const user = c.get('user');
        const { password, twoFactorEnabled } = c.req.valid('json');
        const updatedUser = await this.userService.updateTwoFactorEnabled(
            user.id,
            password,
            twoFactorEnabled,
        );
        return c.json(
            ApiResponse.success(updatedUser, 'Two-factor authentication status updated'),
            200,
        );
    };

    followUser = async (c: ParamContext<UserIdParamSchema>) => {
        const user = c.get('user');
        const { id: followingId } = c.req.valid('param');
        const result = await this.userService.followUser(user.id, followingId);
        return c.json(ApiResponse.success(result, 'User followed successfully'), 200);
    };

    unfollowUser = async (c: ParamContext<UserIdParamSchema>) => {
        const user = c.get('user');
        const { id: followingId } = c.req.valid('param');
        const result = await this.userService.unfollowUser(user.id, followingId);
        return c.json(ApiResponse.success(result, 'User unfollowed successfully'), 200);
    };

    getFollowers = async (c: ParamContext<UserIdParamSchema>) => {
        const idParam = c.req.param('id');
        const userId = idParam ? parseInt(idParam) : c.get('user').id;
        const followers = await this.userService.getFollowers(userId);
        return c.json(ApiResponse.success(followers), 200);
    };

    getFollowing = async (c: ParamContext<UserIdParamSchema>) => {
        const idParam = c.req.param('id');
        const userId = idParam ? parseInt(idParam) : c.get('user').id;
        const following = await this.userService.getFollowing(userId);
        return c.json(ApiResponse.success(following), 200);
    };

    updateAvatar = async (c: TypedContext<any, any, any, AvatarUpdateSchema>) => {
        const user = c.get('user');
        const { avatar } = c.req.valid('form');

        if (!(avatar instanceof File)) {
            throw new MediaError('Avatar file is required');
        }

        const updatedUser = await this.userService.updateAvatar(user.id, avatar);
        return c.json(ApiResponse.success(updatedUser, 'Avatar updated successfully'), 200);
    };

    updateBanner = async (c: TypedContext<any, any, any, BannerUpdateSchema>) => {
        const user = c.get('user');
        const { banner } = c.req.valid('form');

        if (!(banner instanceof File)) {
            throw new MediaError('Banner file is required');
        }

        const updatedUser = await this.userService.updateBanner(user.id, banner);
        return c.json(ApiResponse.success(updatedUser, 'Banner updated successfully'), 200);
    };
}
