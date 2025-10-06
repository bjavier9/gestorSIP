import { Router } from 'express';
import { Container } from 'inversify';
import { EnteController } from '../infrastructure/http/ente.controller';
import { TYPES } from '../config/types';
import { asyncHandler } from '../middleware/asyncHandler';
import { authMiddleware } from '../middleware/authMiddleware';

export const createEntesRoutes = (container: Container): Router => {
    const router = Router();
    const controller = container.get<EnteController>(TYPES.EnteController);

    router.use(authMiddleware);

    router.post('/', asyncHandler(controller.create.bind(controller)));
    router.get('/:id', asyncHandler(controller.getById.bind(controller)));
    router.put('/:id', asyncHandler(controller.update.bind(controller)));

    return router;
};
