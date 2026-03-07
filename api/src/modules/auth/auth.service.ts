import { LoggerService } from '@platform/logger/logger.service';
import { AuthRepository } from './auth.repository';
import { generateAuthTokens, hashString, verifyHash } from '@shared/utils/auth';

export class AuthService {
    constructor(
        private authRepository: AuthRepository,
        private logger: LoggerService,
    ) {}

    async createUser(body: any): Promise<{ accessToken: string; refreshToken: string }> {
        const { name, email, password, username, bio, link, avatar, timezone } = body;

        const isUserExist =
            (await this.authRepository.findUserByEmail(email)) ||
            (await this.authRepository.findUserByUsername(username));

        if (isUserExist) {
            throw new Error('User already exists');
        }

        const hashedPassword = await hashString(password);

        const userData = {
            name,
            email,
            password: hashedPassword,
            username,
            bio,
            link,
            avatar,
            timezone,
        };

        const createdUser = await this.authRepository.createUser(userData);

        const { accessToken, refreshToken } = generateAuthTokens({
            id: createdUser.id.toString(),
            email: createdUser.email,
            username: createdUser.username,
        });

        const hashedRefreshToken = await hashString(refreshToken);
        await this.authRepository.updateRefreshToken(createdUser.id, hashedRefreshToken);

        this.logger.info('Registering new user', { email, username });

        return { accessToken, refreshToken };
    }

    async login(
        body: any,
    ): Promise<{
        twoFactorEnabled: boolean;
        authTokens: { accessToken: string; refreshToken: string };
    }> {
        const { email, password, username } = body;

        const user =
            (await this.authRepository.findUserByEmail(email)) ||
            (await this.authRepository.findUserByUsername(username));

        if (!user) {
            throw new Error('User does not exist');
        }

        if (!user.password) {
            throw new Error(
                'User has no saved password. Please use social login or reset password.',
            );
        }

        const isPasswordCorrect = await verifyHash(user.password, password);

        if (!isPasswordCorrect) {
            throw new Error('Invalid password');
        }

        const { accessToken, refreshToken } = generateAuthTokens({
            id: user.id.toString(),
            email: user.email,
            username: user.username,
        });

        // TODO: Add caching
        // and add otp verification
        // await this.cache.set(`user:${user.id}`, JSON.stringify(user), 60 * 60 * 24);

        const hashedRefreshToken = await hashString(refreshToken);
        await this.authRepository.updateRefreshToken(user.id, hashedRefreshToken);

        this.logger.info('User logged in successfully', { userId: user.id });

        return {
            twoFactorEnabled: user.twoFactorEnabled,
            authTokens: { accessToken, refreshToken },
        };
    }

    async logout() {
        return { message: 'Logged out successfully' };
    }
}
