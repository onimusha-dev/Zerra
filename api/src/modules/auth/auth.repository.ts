import { DatabaseService } from '@platform/database';
import {
    RegisterSchema,
    LoginSchema,
    ForgotPasswordSchema,
    ResetPasswordSchema,
    VerifyEmailSchema,
} from './auth.validator';

/**
 * @module
 *   db - DabaseService
 */
export class AuthRepository {
    constructor(private readonly db: DatabaseService) {}

    get user() {
        return this.db.prisma.user;
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

    async createUser(user: RegisterSchema) {
        return this.user.create({
            data: user,
        });
    }

    async updateRefreshToken(userId: number, refreshToken: string) {
        return this.user.update({
            where: { id: userId },
            data: { refreshToken },
        });
    }
}
