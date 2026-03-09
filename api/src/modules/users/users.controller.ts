import { JSONContext } from '@platform/http/types';
import { CacheService } from '@platform/cache';
import { LoggerService } from '@platform/logger/logger.service';
import { UsersService } from './users.service';
import {
    ChangeEmailSchema,
    ChangePasswordSchema,
    ChangeTwoFactorSchema,
    DeleteUserSchema,
    UserUpdateSchema,
} from './users.validator';
import { ApiResponse } from '@shared/json';

export class UsersController {
    constructor(
        private readonly userService: UsersService,
        private readonly cache: CacheService,
    ) {}

    getUser = async (c: JSONContext<any>) => {
        const userIdParam = c.req.param('id');
        if (userIdParam) {
            const user = await this.userService.getProfile(parseInt(userIdParam));
            return c.json(ApiResponse.success(user), 200);
        }

        const user = c.get('user');
        const userFromDB = await this.userService.getUserById(user.id);
        return c.json(ApiResponse.success(userFromDB), 200);
    };

    updateUser = async (c: JSONContext<UserUpdateSchema>) => {
        const user = c.get('user');
        const body = c.req.valid('json');

        const filteredBody = Object.fromEntries(
            Object.entries(body).filter(([_, v]) => v !== undefined),
        ) as any;

        const updatedUser = await this.userService.updateProfile(user.id, filteredBody);
        return c.json(ApiResponse.success(updatedUser, 'Profile updated successfully'), 200);
    };

    deleteUser = async (c: JSONContext<DeleteUserSchema>) => {
        const user = c.get('user');
        const { password } = c.req.valid('json');
        const result = await this.userService.deleteUser(user.id, password);
        return c.json(ApiResponse.success(result, 'User deleted successfully'), 200);
    };

    changePassword = async (c: JSONContext<ChangePasswordSchema>) => {
        const user = c.get('user');
        const { oldPassword, newPassword } = c.req.valid('json');
        const updatedUser = await this.userService.updatePassword(
            user.id,
            oldPassword,
            newPassword,
        );
        return c.json(ApiResponse.success(updatedUser, 'Password updated successfully'), 200);
    };

    changeEmail = async (c: JSONContext<ChangeEmailSchema>) => {
        const user = c.get('user');
        const { email, password } = c.req.valid('json');
        const updatedUser = await this.userService.updateEmail(user.id, email, password);
        return c.json(ApiResponse.success(updatedUser, 'Email updated successfully'), 200);
    };

    changeTwoFactorAuthentication = async (c: JSONContext<ChangeTwoFactorSchema>) => {
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
}
