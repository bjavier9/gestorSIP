import { Router } from 'express';
import { Container } from 'inversify';
import { LeadController } from '../infrastructure/http/lead.controller';
import { TYPES } from '../config/types';
import { asyncHandler } from '../middleware/asyncHandler';
import { authMiddleware } from '../middleware/authMiddleware';

export const createLeadRoutes = (container: Container): Router => {
    const router = Router();
    const controller = container.get<LeadController>(TYPES.LeadController);

    router.use(authMiddleware);

    router.post('/', asyncHandler(controller.create.bind(controller)));
    router.get('/:id', asyncHandler(controller.getById.bind(controller)));
    router.get('/', asyncHandler(controller.getByCriteria.bind(controller)));

    return router;
};
