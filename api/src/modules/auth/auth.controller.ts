import { CacheService } from '@platform/cache';
import { LoggerService } from '@platform/logger/logger.service';
import { AuthService } from './auth.service';
import { Context } from 'hono';
import { setCookie } from 'hono/cookie';
import { ConfigService } from '@platform/config';
import { HTTP_STATUS } from '@shared/constants/httpStatus';

export class AuthController {
    constructor(
        private readonly config: ConfigService,
        private readonly authService: AuthService,
        private readonly cache: CacheService,
        private readonly logger: LoggerService,
    ) {}

    register = async (c: Context): Promise<any> => {
        try {
            const body = await c.req.json();
            const { accessToken, refreshToken } = await this.authService.createUser(body);

            setCookie(c, 'access_token', accessToken, {
                httpOnly: this.config.httpOnly_cookies,
                secure: this.config.secure_cookies,
                sameSite: 'strict',
                path: '/',
                maxAge: this.config.access_token_expiry_seconds,
            });

            setCookie(c, 'refresh_token', refreshToken, {
                httpOnly: this.config.httpOnly_cookies,
                secure: this.config.secure_cookies,
                sameSite: 'strict',
                path: '/auth/refresh-token',
                maxAge: this.config.refresh_token_expiry_seconds,
            });

            return c.json(
                {
                    success: true,
                    message: 'User registered successfully',
                    data: {
                        accessToken,
                        refreshToken,
                    },
                },
                201,
            );
        } catch (error: any) {
            this.logger.error('Registration failed', { error: error.message });
            return c.json(
                {
                    success: false,
                    message: 'Registration failed',
                    error: error.message,
                },
                400,
            );
        }
    };

    /**
     * @description provides two different responses -
     *      1. If user is 2fa enabled, it will ask a redirect to otp-verify
     *      2. If user is not 2fa enabled, it will log the user in
     * @param c
     * @returns
     */
    login = async (c: Context) => {
        try {
            const body = await c.req.json();
            const { twoFactorEnabled, authTokens } = await this.authService.login(body);

            // if user is 2fa enabled, redirect to otp-verify
            if (twoFactorEnabled) {
                return c.redirect('/otp-verify', HTTP_STATUS.REDIRECT);
            }

            // if user is not 2fa enabled, log the user in
            setCookie(c, 'access_token', authTokens.accessToken, {
                httpOnly: this.config.httpOnly_cookies,
                secure: this.config.secure_cookies,
                sameSite: 'strict',
                path: '/',
                maxAge: this.config.access_token_expiry_seconds,
            });

            setCookie(c, 'refresh_token', authTokens.refreshToken, {
                httpOnly: this.config.httpOnly_cookies,
                secure: this.config.secure_cookies,
                sameSite: 'strict',
                path: '/auth/refresh-token',
                maxAge: this.config.refresh_token_expiry_seconds,
            });

            return c.json(
                {
                    success: true,
                    twoFactorEnabled,
                    message: 'User logged in successfully',
                    data: {
                        accessToken: authTokens.accessToken,
                        refreshToken: authTokens.refreshToken,
                    },
                },
                HTTP_STATUS.OK,
            );
        } catch (error: any) {
            this.logger.error('Login failed', { error: error.message });
            return c.json(
                {
                    success: false,
                    message: 'Login failed',
                    error: error.message,
                },
                400,
            );
        }
    };

    logout = async (c: Context) => {
        this.logger.info('Logout requested');
        return c.json({ message: 'Logged out successfully' });
    };

    forgotPassword = async (c: Context) => {
        this.logger.info('Forgot Password requested');
        return c.json({ message: 'Password reset link sent to email' });
    };

    resetPassword = async (c: Context) => {
        this.logger.info('Reset Password requested');
        return c.json({ message: 'Password reset successful' });
    };

    rotateTokens = async (c: Context) => {
        this.logger.info('Token rotation requested');
        return c.json({ message: 'Token rotation successful' });
    };

    verifyEmail = async (c: Context) => {
        this.logger.info('Email verification requested');
        return c.json({ message: 'Email verified successfully' });
    };
}
