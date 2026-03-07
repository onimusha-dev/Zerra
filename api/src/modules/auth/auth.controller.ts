import { CacheService } from '@platform/cache';
import { LoggerService } from '@platform/logger/logger.service';
import { AuthService } from './auth.service';
import { Context } from 'hono';
import { setCookie, deleteCookie, getCookie } from 'hono/cookie';
import { ConfigService } from '@platform/config';
import { HTTP_STATUS } from '@shared/constants/httpStatus';

export class AuthController {
    constructor(
        private readonly config: ConfigService,
        private readonly authService: AuthService,
        private readonly cache: CacheService,
        private readonly logger: LoggerService,
    ) {}

    register = async (c: Context): Promise<Response> => {
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
            this.logger.error('Registration failed', { error });
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
    login = async (c: Context): Promise<Response> => {
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
            this.logger.error('Login failed', { error });
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

    logout = async (c: Context): Promise<Response> => {
        const user = c.get('user') as any;

        if (!user) {
            return c.json(
                { success: false, message: 'Not authenticated' },
                HTTP_STATUS.UNAUTHORIZED,
            );
        }

        const { success, message } = await this.authService.logout(parseInt(user.id));

        deleteCookie(c, 'access_token', { path: '/' });
        deleteCookie(c, 'refresh_token', { path: '/auth/refresh-token' });

        this.logger.info('Logout successful', { userId: user.id });
        return c.json({ success, message });
    };

    forgotPassword = async (c: Context): Promise<Response> => {
        this.logger.info('Forgot Password requested');
        try {
            const body = await c.req.json();
            const { email } = body;

            const { success, uuid, message } = await this.authService.forgotPassword(email);

            return c.json({ success, uuid, message });
        } catch (error: any) {
            this.logger.error('Forgot password failed', { error });
            return c.json({ success: false, message: error.message }, 400);
        }
    };

    resetPassword = async (c: Context): Promise<Response> => {
        const { uuid, otp } = await c.req.json();
        const authTokens = await this.authService.resetPassword(uuid, otp);
        this.logger.info('Reset Password requested');
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
                message: 'Password reset successful',
                data: {
                    accessToken: authTokens.accessToken,
                    refreshToken: authTokens.refreshToken,
                },
            },
            HTTP_STATUS.OK,
        );
    };

    rotateTokens = async (c: Context): Promise<Response> => {
        try {
            const refreshTokenCookie = getCookie(c, 'refresh_token');
            const body = await c.req.json().catch(() => ({}));
            const refreshToken =
                refreshTokenCookie || body.refreshToken || c.req.header('X-Refresh-Token');

            if (!refreshToken) {
                throw new Error('Refresh token required');
            }

            const { accessToken, refreshToken: newRefreshToken } =
                await this.authService.rotateTokens(refreshToken);

            setCookie(c, 'access_token', accessToken, {
                httpOnly: this.config.httpOnly_cookies,
                secure: this.config.secure_cookies,
                sameSite: 'strict',
                path: '/',
                maxAge: this.config.access_token_expiry_seconds,
            });

            setCookie(c, 'refresh_token', newRefreshToken, {
                httpOnly: this.config.httpOnly_cookies,
                secure: this.config.secure_cookies,
                sameSite: 'strict',
                path: '/auth/refresh-token',
                maxAge: this.config.refresh_token_expiry_seconds,
            });

            this.logger.info('Token rotation successful');

            return c.json({
                success: true,
                message: 'Token rotation successful',
                data: {
                    accessToken,
                    refreshToken: newRefreshToken,
                },
            });
        } catch (error: any) {
            this.logger.error('Token rotation failed', { error });
            return c.json(
                {
                    success: false,
                    message: error.message || 'Token rotation failed',
                },
                HTTP_STATUS.UNAUTHORIZED,
            );
        }
    };

    verifyEmail = async (c: Context): Promise<Response> => {
        this.logger.info('Email verification requested');
        return c.json({ message: 'Email verified successfully' });
    };
}
