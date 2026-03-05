/**
 * @module constants/httpStatus
 * @description Centralized HTTP status code constants.
 *              Prevents magic numbers throughout the codebase.
 *              Uses `as const` for compile-time literal types.
 */

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE: 422,
    INTERNAL_SERVER: 500,
    SERVICE_UNAVAILABLE: 503,
} as const;

/** Union type of all HTTP status code values. */
export type HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
