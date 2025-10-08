import { Router } from 'express';
import { Container } from 'inversify';
import { PolizaController } from '../infrastructure/http/poliza.controller';
import { TYPES } from '../di/types';
import { asyncHandler } from '../middleware/asyncHandler';
import { authMiddleware } from '../middleware/authMiddleware';

export const createPolizasRoutes = (container: Container): Router => {
    const router = Router();
    const polizaController = container.get<PolizaController>(TYPES.PolizaController);

    // Aplicar middleware de autenticacion a todas las rutas de polizas
    router.use(authMiddleware);

    // GET /api/polizas -> busca por criterios
    router.get('/', asyncHandler(polizaController.getByCriteria.bind(polizaController)));

    // GET /api/polizas/:id
    router.get('/:id', asyncHandler(polizaController.getById.bind(polizaController)));

    return router;
};

