import { LoggerService } from '@platform/logger/logger.service';
import { AuthRepository } from './auth.repository';
import { generateAuthTokens, hashString, verifyHash, verifyToken } from '@shared/utils/auth';
import { CacheService } from '@platform/cache';
import { SmtpService } from '@shared/smtp/smtp.service';

export class AuthService {
    constructor(
        private authRepository: AuthRepository,
        private logger: LoggerService,
        private cache: CacheService,
        private smtp: SmtpService,
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
            id: createdUser.id,
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
            id: user.id,
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

    async logout(id: number): Promise<{ success: boolean; message: string }> {
        const user = await this.authRepository.findUserById(id);

        if (!user) {
            throw Error('User does not exists.');
        }

        const success = await this.authRepository.updateRefreshToken(user.id, '');

        return {
            success: !!success,
            message: success ? 'Logged out successfully' : 'Failed to logout',
        };
    }

    async rotateTokens(
        refreshToken: string,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const id = this.verifyRefreshToken(refreshToken);
        const user = await this.authRepository.findUserById(id);

        if (!user || !user.refreshToken) {
            throw new Error('Session expired or user not found');
        }

        const isMatch = await verifyHash(user.refreshToken, refreshToken);
        if (!isMatch) {
            throw new Error('Invalid refresh token session');
        }

        const tokens = generateAuthTokens({
            id: user.id,
            email: user.email,
            username: user.username,
        });

        const hashedRefreshToken = await hashString(tokens.refreshToken);
        await this.authRepository.updateRefreshToken(user.id, hashedRefreshToken);

        return tokens;
    }

    async forgotPassword(
        email: string,
    ): Promise<{ success: boolean; uuid: string; message: string }> {
        const user = await this.authRepository.findUserByEmail(email);

        if (!user) {
            throw new Error('User does not exists.');
        }
        await this.authRepository.updateRefreshToken(user.id, '');

        const uuid = crypto.randomUUID();
        const otp = this.generateOTP();
        const hashedOtp = await hashString(otp); // FIXED: Added await
        const isOtpCached = await this.cache.set(
            `otp:${uuid}`,
            { id: user.id, otp: hashedOtp, attempts: 1 },
            5 * 60,
        );
        this.logger.debug(`otp:::::::::::::::: ${otp}`);
        if (!isOtpCached) {
            throw new Error('Internal server error, please try again in a few minutes');
        }

        await this.smtp.sendOtpMail({
            name: user.name,
            email: user.email,
            otp: otp.toUpperCase(),
        });
        return { success: true, uuid: uuid, message: 'OTP sent successfully to your email' };
    }

    async resetPassword(
        uuid: string,
        otp: string,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const cachedOtpObject: { id: number; otp: string; attempts: number } | null =
            await this.cache.get(`otp:${uuid}`);

        if (!cachedOtpObject) {
            throw new Error('Otp verification timeout');
        }

        if (cachedOtpObject.attempts > 10) {
            throw new Error('too many attempts');
        }

        const user = await this.authRepository.findUserById(cachedOtpObject.id);
        if (!user) {
            throw new Error('User does not exist');
        }

        // FIXED: Lowercase for case-insensitivity
        const isOtpValid = await verifyHash(cachedOtpObject.otp, otp.toLowerCase());

        if (!isOtpValid) {
            // Increment attempts on failure
            await this.cache.set(
                `otp:${uuid}`,
                { ...cachedOtpObject, attempts: cachedOtpObject.attempts + 1 },
                5 * 60,
            );
            throw new Error('Invalid OTP');
        }

        const tokens = generateAuthTokens({
            id: user.id,
            email: user.email,
            username: user.username,
        });
        await this.authRepository.updateRefreshToken(user.id, tokens.refreshToken);
        await this.cache.delete(`otp:${uuid}`);
        return tokens;
    }

    verifyAccessToken(token: string) {
        const payload = verifyToken(token, 'access');
        if (!payload) {
            throw new Error('Invalid session');
        }
        return payload;
    }

    verifyRefreshToken(token: string) {
        const payload = verifyToken(token, 'refresh');
        if (!payload) {
            throw new Error('Invalid session');
        }
        return payload.id;
    }

    generateOTP(length = 6): string {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let otp = '';

        for (let i = 0; i < length; i++) {
            const index = Math.floor(Math.random() * chars.length);
            otp += chars[index];
        }
        return otp.toLocaleLowerCase();
    }
}
