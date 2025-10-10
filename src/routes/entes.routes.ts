import { Router } from 'express';
import { Container } from 'inversify';
import { EnteController } from '../infrastructure/http/ente.controller';
import { TYPES } from '../di/types';
import { asyncHandler } from '../middleware/async-handler.middleware';
import { authMiddleware } from '../middleware/authentication.middleware';

export const createEntesRoutes = (container: Container): Router => {
    const router = Router();
    const controller = container.get<EnteController>(TYPES.EnteController);

    router.use(authMiddleware);

    router.post('/', asyncHandler(controller.create.bind(controller)));
    router.get('/', asyncHandler(controller.getAll.bind(controller)));
    router.get('/:id', asyncHandler(controller.getById.bind(controller)));
    router.put('/:id', asyncHandler(controller.update.bind(controller)));
    router.delete('/:id', asyncHandler(controller.delete.bind(controller)));

    return router;
};
