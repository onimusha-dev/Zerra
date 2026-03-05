import { Context } from 'hono';
import { HTTP_STATUS } from '../../shared/constants/httpStatus.js';
import { ApiResponse } from '../../shared/json/apiResponse.js';

/**
 * @module homeController
 * @description Handlers for health-check API endpoints.
 */
export class HealthController {
    constructor() {
        // private readonly dataBase: DataBaseService,
        // private readonly cache: CacheService
    }

    getHome = (c: Context) => {
        const response = new ApiResponse(
            HTTP_STATUS.OK,
            {
                version: '1.0.0',
                environment: process.env.NODE_ENV || 'development',
            },
            'API is running',
        );

        return c.json(response.toJSON(), HTTP_STATUS.OK);
    };

    healthCheck = (c: Context) => {
        const response = new ApiResponse(
            HTTP_STATUS.OK,
            {
                uptime: process.uptime(),
                timestamp: Date.now(),
                status: 'healthy',
            },
            'Health check passed',
        );

        return c.json(response.toJSON(), HTTP_STATUS.OK);
    };
}
