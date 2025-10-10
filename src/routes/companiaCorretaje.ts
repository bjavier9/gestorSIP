import { Router } from 'express';
import { Container } from 'inversify';
import { CompaniaCorretajeController } from '../infrastructure/http/companiaCorretaje.controller';
import { TYPES } from '../di/types';
import { asyncHandler } from '../middleware/asyncHandler';
import { authMiddleware } from '../middleware/authMiddleware';
import { isSuperAdmin } from '../presentation/middlewares/auth.middleware';

export const createCompaniaCorretajeRoutes = (container: Container): Router => {
    const router = Router();
    const controller = container.get<CompaniaCorretajeController>(TYPES.CompaniaCorretajeController);

    // Aplica a todas las rutas de este router
    router.use(authMiddleware);
    router.use(isSuperAdmin); // Requiere Superadmin para TODAS las rutas de este archivo

    // Rutas solo para Superadmin
    router.get('/', asyncHandler(controller.getAll.bind(controller)));
    router.post('/', asyncHandler(controller.create.bind(controller)));
    router.get('/:id', asyncHandler(controller.getById.bind(controller)));
    router.put('/:id', asyncHandler(controller.update.bind(controller)));
    router.put('/:id/activar', asyncHandler(controller.activar.bind(controller)));
    router.put('/:id/desactivar', asyncHandler(controller.desactivar.bind(controller)));

    return router;
};
