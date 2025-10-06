import { Router } from 'express';
import { Container } from 'inversify';
import { AseguradoraController } from '../infrastructure/http/aseguradora.controller';
import { TYPES } from '../config/types';
import { asyncHandler } from '../middleware/asyncHandler';
import { authMiddleware } from '../middleware/authMiddleware';

export const createAseguradorasRoutes = (container: Container): Router => {
    const router = Router();
    const controller = container.get<AseguradoraController>(TYPES.AseguradoraController);

    router.use(authMiddleware);

    router.get('/', asyncHandler(controller.getAll.bind(controller)));

    return router;
};
