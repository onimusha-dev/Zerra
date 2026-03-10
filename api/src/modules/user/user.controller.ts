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
} from './user.validator';
import { ApiResponse } from '@shared/json';

export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly cache: CacheService,
    ) {}

    getUser = async (c: TypedContext<any, UserIdParamSchema>) => {
        const user = c.get('user');
        const { id: userIdParam } = c.req.param();
        if (userIdParam) {
            const profile = await this.userService.getProfile(parseInt(userIdParam), user?.id);
            return c.json(ApiResponse.success(profile), 200);
        }

        const userFromDB = await this.userService.getUserById(user.id);
        return c.json(ApiResponse.success(userFromDB), 200);
    };

    updateUser = async (c: TypedContext<UserUpdateSchema>) => {
        const user = c.get('user');
        const body = c.req.valid('json');

        const filteredBody = Object.fromEntries(
            Object.entries(body).filter(([_, v]) => v !== undefined),
        ) as any;

        const updatedUser = await this.userService.updateProfile(user.id, filteredBody);
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
}
