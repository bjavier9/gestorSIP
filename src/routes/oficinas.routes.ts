import { Router } from 'express';
import { Container } from 'inversify';
import { OficinaController } from '../infrastructure/http/oficina.controller';
import { TYPES } from '../di/types';
import { asyncHandler } from '../middleware/async-handler.middleware';

export const createOficinaRoutes = (container: Container): Router => {
    // mergeParams: true es necesario para acceder a los params de rutas padre (ej. /companias/:companiaId/oficinas)
    const router = Router({ mergeParams: true }); 
    const controller = container.get<OficinaController>(TYPES.OficinaController);

    router.post('/', asyncHandler(controller.create.bind(controller)));
    router.get('/', asyncHandler(controller.getByCompania.bind(controller)));

    return router;
};
