import { Router } from 'express';
import { Container } from 'inversify';
import { CompaniaCorretajeController } from '../infrastructure/http/companiaCorretaje.controller';
import { TYPES } from '../config/types';
import { asyncHandler } from '../middleware/asyncHandler';

export const createCompaniaCorretajeRoutes = (container: Container): Router => {
    const router = Router();
    const controller = container.get<CompaniaCorretajeController>(TYPES.CompaniaCorretajeController);

    router.post('/', asyncHandler(controller.create.bind(controller)));
    router.get('/:id', asyncHandler(controller.getById.bind(controller)));

    return router;
};
