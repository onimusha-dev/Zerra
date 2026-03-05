import { HttpStatusCode } from '@shared/constants/httpStatus';

export class AppError extends Error {
    constructor(
        public readonly statusCode: number,
        public readonly message: string,
        public readonly isOperational = true,
        public readonly code?: string,
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        return {
            error: {
                code: this.code,
                message: this.message,
                statusCode: this.statusCode,
            },
        };
    }
}

export class ValidationError extends AppError {
    constructor(
        message: string,
        public readonly fields?: Record<string, string[]>,
    ) {
        super(400, message, true, 'VALIDATION_ERROR');
    }

    toJSON() {
        return {
            error: {
                code: this.code,
                message: this.message,
                statusCode: this.statusCode,
                fields: this.fields,
            },
        };
    }
}

export class AuthenticationError extends AppError {
    constructor(message = 'Authentication required') {
        super(401, message, true, 'AUTHENTICATION_ERROR');
    }
}

export class AuthorizationError extends AppError {
    constructor(message = 'Insufficient permissions') {
        super(403, message, true, 'AUTHORIZATION_ERROR');
    }
}

export class ForbiddenError extends AppError {
    constructor(
        message = 'You do not have permission to perform this action',
        public readonly requiredPermission?: string,
    ) {
        super(403, message, true, 'FORBIDDEN');
    }
}

export class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(404, `${resource} not found`, true, 'NOT_FOUND');
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(409, message, true, 'CONFLICT');
    }
}

export class RateLimitError extends AppError {
    constructor(
        message = 'Too many requests',
        public readonly retryAfter?: number,
    ) {
        super(429, message, true, 'RATE_LIMIT_EXCEEDED');
    }
}

export class InternalServerError extends AppError {
    constructor(message = 'Internal server error') {
        super(500, message, false, 'INTERNAL_ERROR');
    }
}

export class ServiceUnavailableError extends AppError {
    constructor(message = 'Service temporarily unavailable') {
        super(503, message, false, 'SERVICE_UNAVAILABLE');
    }
}
