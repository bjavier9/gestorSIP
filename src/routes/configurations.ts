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

    router.get('/:configName', asyncHandler(controller.get.bind(controller)));

    return router;
};
