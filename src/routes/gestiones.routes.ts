import { Router } from 'express';
import { Container } from 'inversify';
import { GestionController } from '../infrastructure/http/gestion.controller';
import { TYPES } from '../di/types';
import { asyncHandler } from '../middleware/async-handler.middleware';
import { authMiddleware } from '../middleware/authentication.middleware';

export const createGestionesRoutes = (container: Container): Router => {
    const router = Router();
    const controller = container.get<GestionController>(TYPES.GestionController);

    router.use(authMiddleware);

    router.post('/', asyncHandler(controller.create.bind(controller)));
    router.get('/:id', asyncHandler(controller.getById.bind(controller)));

    return router;
};
