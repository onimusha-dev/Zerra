import { Hono } from 'hono';
import { HealthController } from './health.controller';

/**
 *
 * @param controller HealthController
 * @returns Hono
 *
 *  @GET /health         -> liveness
 *  @GET /health/ready   -> readiness
 *  @GET /health/details -> dependency checks
 *
 */
export function createHealthRoutes(controller: HealthController): Hono {
    const router = new Hono();

    router.get('/', controller.getHome);
    router.get('/ready', controller.healthCheck);
    router.get('/details', controller.healthCheck);

    return router;
}
