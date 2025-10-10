import { Router } from 'express';
import { Container } from 'inversify';
import { LeadController } from '../infrastructure/http/lead.controller';
import { TYPES } from '../di/types';
import { asyncHandler } from '../middleware/async-handler.middleware';
import { authMiddleware } from '../middleware/authentication.middleware';

export const createLeadRoutes = (container: Container): Router => {
    const router = Router();
    const controller = container.get<LeadController>(TYPES.LeadController);

    router.use(authMiddleware);

    router.get('/', asyncHandler(controller.getAll.bind(controller)));
    router.post('/', asyncHandler(controller.create.bind(controller)));
    router.get('/:id', asyncHandler(controller.getById.bind(controller)));
    router.put('/:id', asyncHandler(controller.update.bind(controller)));
    router.delete('/:id', asyncHandler(controller.delete.bind(controller)));

    return router;
};
