/**
 * @module utils/apiResponse
 * @description Standardized API response and error classes for Hono.
 *              Use ApiResponse for successful results and ApiError for failures.
 *              Includes toJSON() for easy serialization with c.json().
 */

import { HttpStatusCode } from '@shared/constants/httpStatus';

/** Wraps a successful response with a consistent shape. */
export class ApiResponse<T = unknown> {
    public statusCode: HttpStatusCode;
    public data: T;
    public message: string;
    public success: boolean;

    constructor(statusCode: HttpStatusCode, data: T, message = 'Success') {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }

    /** Serialize to a plain object for c.json(). */
    toJSON() {
        return {
            success: this.success,
            message: this.message,
            data: this.data,
        };
    }
}

/** Represents an operational error with an HTTP status code. */
export class ApiError extends Error {
    public statusCode: HttpStatusCode;
    public success: false;
    public errors: string[];

    constructor(
        statusCode: HttpStatusCode,
        message = 'Something went wrong',
        errors: string[] = [],
    ) {
        super(message);
        this.statusCode = statusCode;
        this.success = false;
        this.errors = errors;
    }
}
