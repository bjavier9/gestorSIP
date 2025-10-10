import { Router } from 'express';
import { Container } from 'inversify';
import { CompaniaCorretajeController } from '../infrastructure/http/companiaCorretaje.controller';
import { TYPES } from '../di/types';
import { asyncHandler } from '../middleware/async-handler.middleware';
import { authMiddleware as authenticate } from '../middleware/authentication.middleware';
import { isSuperAdmin } from '../middleware/authorization.middleware';
import { validateCompaniaAccess } from '../middleware/validate-compania-access.middleware';

export const createCompaniaCorretajeRoutes = (container: Container): Router => {
    const router = Router();
    const controller = container.get<CompaniaCorretajeController>(TYPES.CompaniaCorretajeController);

    // Middleware de autenticación general para todas las rutas de compañías
    router.use(authenticate);

    // Rutas solo para Super Admin
    router.get('/', isSuperAdmin, asyncHandler(controller.getAll.bind(controller)));
    router.post('/', isSuperAdmin, asyncHandler(controller.create.bind(controller)));
    router.put('/:id/activar', isSuperAdmin, asyncHandler(controller.activar.bind(controller)));
    router.put('/:id/desactivar', isSuperAdmin, asyncHandler(controller.desactivar.bind(controller)));

    // Rutas con validación de pertenencia (o Super Admin)
    router.get('/:id', validateCompaniaAccess, asyncHandler(controller.getById.bind(controller)));
    router.put('/:id', validateCompaniaAccess, asyncHandler(controller.update.bind(controller)));

    return router;
};
