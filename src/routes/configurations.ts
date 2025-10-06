import { Router } from 'express';
import { Container } from 'inversify';
import { ConfigurationController } from '../infrastructure/http/configuration.controller';
import { TYPES } from '../config/types';
import { asyncHandler } from '../middleware/asyncHandler';
import { authMiddleware } from '../middleware/authMiddleware';

export const createConfigurationRoutes = (container: Container): Router => {
    const router = Router();
    const controller = container.get<ConfigurationController>(TYPES.ConfigurationController);

    router.use(authMiddleware);

    router.get('/', asyncHandler(controller.getAllConfigurations.bind(controller)));
    router.get('/:id', asyncHandler(controller.getConfigurationById.bind(controller)));
    router.post('/', asyncHandler(controller.createConfiguration.bind(controller)));
    router.put('/:id', asyncHandler(controller.updateConfiguration.bind(controller)));

    return router;
};

