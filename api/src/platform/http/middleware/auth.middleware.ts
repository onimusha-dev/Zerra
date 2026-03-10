import { AuthService } from '@modules/auth/auth.service';
import { ConfigService } from '@platform/config';
import { LoggerService } from '@platform/logger/logger.service';
import { AppEnv } from '@platform/http/types';
import { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception';

export class AuthMiddleware {
    constructor(
        private readonly config: ConfigService,
        private readonly logger: LoggerService,
        private readonly authService: AuthService,
    ) {}

    validateUserSession = async (c: Context<AppEnv>, next: Next) => {
        const authHeader = c.req.header('Authorization');
        const accessToken = getCookie(c, 'access_token');

        let token: string | undefined;

        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (accessToken) {
            token = accessToken;
        }

        if (!token) {
            throw new HTTPException(401, { message: 'Authentication required' });
        }

        try {
            const payload = this.authService.verifyAccessToken(token);
            c.set('user', payload);
            await next();
        } catch (error: any) {
            this.logger.error('Session validation failed', { error: error.message });
            throw new HTTPException(401, { message: 'Invalid or expired session' });
        }
    };

    optionalUserSession = async (c: Context<AppEnv>, next: Next) => {
        const authHeader = c.req.header('Authorization');
        const accessToken = getCookie(c, 'access_token');

        let token: string | undefined;

        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (accessToken) {
            token = accessToken;
        }

        if (token) {
            try {
                const payload = this.authService.verifyAccessToken(token);
                c.set('user', payload);
            } catch (error: any) {
                // Silently fail for optional auth
                this.logger.warn(
                    'Optional session validation failed, continuing without user context',
                );
            }
        }

        await next();
    };
}
