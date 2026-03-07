import { Hono } from 'hono';

import { HealthController } from './health.controller';

/**
 *
 * @param controller HealthController
 * @returns Hono
 *
 *  @GET /health         -> liveness
 *  @GET /health/live   -> readiness
 *  @GET /health/ready -> dependency checks
 *
 */
export function createHealthRoutes(controller: HealthController): Hono {
    const router = new Hono();

    router.get('/', controller.health);
    router.get('/live', controller.liveness);
    router.get('/ready', controller.readiness);

    return router;
}
