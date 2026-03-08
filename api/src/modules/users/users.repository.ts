import { DatabaseService } from '@platform/database';
import { RegisterSchema } from '../../modules/auth/auth.validator';
import { IUpdateUserProfile } from '@shared/types';

export class UserRepository {
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
