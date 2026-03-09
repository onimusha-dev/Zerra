import { LoggerService } from '@platform/logger/logger.service';
import { UserRepository } from './users.repository';
import { hashString, verifyHash } from '@shared/utils/auth';
import { IUser, IUpdateUserProfile } from '@shared/types';
import { AuthenticationError, ConflictError, NotFoundError } from '@shared/json';

/**
 * @TODO - remove sensetive info form the returned object
 *       - set proper returned type
 */
export class UsersService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly logger: LoggerService,
    ) {}

    private stripSensitiveData(user: any) {
        const { password, ...safeUser } = user;
        return safeUser;
    }

    async getUserById(id: number): Promise<IUser> {
        const user = await this.userRepository.findUserById(id);
        if (!user) {
            throw new NotFoundError('User');
        }
        return this.stripSensitiveData(user) as IUser;
    }

    async getProfile(id: number): Promise<IUpdateUserProfile> {
        const user = await this.userRepository.findUserById(id);
        if (!user) {
            throw new NotFoundError('User');
        }
        const safeUser = this.stripSensitiveData(user) as IUser;
        const { email, ...profile } = safeUser;
        return profile;
    }

    async updateProfile(id: number, profile: IUpdateUserProfile) {
        const user = await this.userRepository.findUserById(id);
        if (!user) {
            throw new NotFoundError('User');
        }
        const updatedUser = await this.userRepository.updateUserProfile(id, profile);
        this.logger.info('Profile updated successfully', { userId: id });
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
}
