import { Hono } from 'hono';
import { UsersController } from './users.controller';
/**
 *
 * @param controller UsersController
 * @returns Hono
 *
 *  @GET /health         -> liveness
 *  @GET /health/ready   -> readiness
 *  @GET /health/details -> dependency checks
 *
 */
export function createUsersRoutes(controller: UsersController): Hono {
    const router = new Hono();

    // router.get('health', controller.getHome);
    // router.get('health/ready', controller.healthCheck);
    // router.get('health/details', controller.healthCheck);

    return router;
}
