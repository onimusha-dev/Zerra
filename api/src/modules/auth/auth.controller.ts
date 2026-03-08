import { CacheService } from '@platform/cache';
import { LoggerService } from '@platform/logger/logger.service';
import { AuthService } from './auth.service';
import { setCookie, deleteCookie, getCookie } from 'hono/cookie';
import { ConfigService } from '@platform/config';
import { HTTP_STATUS } from '@shared/constants/httpStatus';
import { JSONContext } from '@platform/http/types';
import {
    LoginSchema,
    RegisterSchema,
    ForgotPasswordSchema,
    ResetPasswordSchema,
    VerifyEmailSchema,
} from './auth.validator';
import { ApiResponse, AuthenticationError } from '@shared/json';

export class AuthController {
    constructor(
        private readonly config: ConfigService,
        private readonly authService: AuthService,
        private readonly cache: CacheService,
        private readonly logger: LoggerService,
    ) {}

    register = async (c: JSONContext<RegisterSchema>): Promise<Response> => {
        const body = c.req.valid('json');
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
            ApiResponse.success({ accessToken, refreshToken }, 'User registered successfully'),
            HTTP_STATUS.CREATED,
        );
    };

    login = async (c: JSONContext<LoginSchema>): Promise<Response> => {
        const body = c.req.valid('json');
        const { twoFactorEnabled, authTokens } = await this.authService.login(body);

        if (twoFactorEnabled) {
            return c.redirect('/otp-verify', HTTP_STATUS.REDIRECT);
        }

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
            ApiResponse.success(
                {
                    accessToken: authTokens.accessToken,
                    refreshToken: authTokens.refreshToken,
                    twoFactorEnabled,
                },
                'User logged in successfully',
            ),
            HTTP_STATUS.OK,
        );
    };

    logout = async (c: JSONContext<any>): Promise<Response> => {
        const user = c.get('user');
        if (!user) {
            throw new AuthenticationError('Not authenticated');
        }

        const { message } = await this.authService.logout(user.id);

        deleteCookie(c, 'access_token', { path: '/' });
        deleteCookie(c, 'refresh_token', { path: '/auth/refresh-token' });

        this.logger.info('Logout successful', { userId: user.id });
        return c.json(ApiResponse.success(null, message), HTTP_STATUS.OK);
    };

    forgotPassword = async (c: JSONContext<ForgotPasswordSchema>): Promise<Response> => {
        const email = c.req.valid('json');
        const { uuid, message } = await this.authService.forgotPassword(email);
        return c.json(ApiResponse.success({ uuid }, message), HTTP_STATUS.OK);
    };

    resetPassword = async (c: JSONContext<ResetPasswordSchema>): Promise<Response> => {
        const { uuid, otp, password } = c.req.valid('json');
        const authTokens = await this.authService.resetPassword(uuid, otp, password);

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
            ApiResponse.success(
                {
                    accessToken: authTokens.accessToken,
                    refreshToken: authTokens.refreshToken,
                },
                'Password reset successful',
            ),
            HTTP_STATUS.OK,
        );
    };

    rotateTokens = async (c: JSONContext<any>): Promise<Response> => {
        const refreshTokenCookie = getCookie(c, 'refresh_token');
        const body = await c.req.json().catch(() => ({}));
        const refreshToken =
            refreshTokenCookie || body.refreshToken || c.req.header('X-Refresh-Token');

        if (!refreshToken) {
            throw new AuthenticationError('Refresh token required');
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

        return c.json(
            ApiResponse.success(
                {
                    accessToken,
                    refreshToken: newRefreshToken,
                },
                'Token rotation successful',
            ),
            HTTP_STATUS.OK,
        );
    };

    verifyEmail = async (c: JSONContext<VerifyEmailSchema>): Promise<Response> => {
        const { email, token, code } = c.req.valid('json');
        this.logger.info('Email verification requested', { email });
        return c.json(ApiResponse.success(null, 'Email verified successfully'), HTTP_STATUS.OK);
    };
}
