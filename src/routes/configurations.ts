
import { Router } from 'express';
import container from '../config/container';
import { TYPES } from '../config/types';
import { ConfigurationController } from '../infrastructure/http/configuration.controller';
import { authMiddleware, superAdminMiddleware } from '../middleware/authMiddleware';
import asyncHandler from 'express-async-handler';

const router = Router();
const configurationController = container.get<ConfigurationController>(TYPES.ConfigurationController);

// Rutas públicas (solo requieren autenticación)
router.get(
    '/',
    authMiddleware,
    asyncHandler(configurationController.getAllConfigurations.bind(configurationController))
);

router.get(
    '/:id',
    authMiddleware,
    asyncHandler(configurationController.getConfigurationById.bind(configurationController))
);

// Rutas protegidas (requieren rol de superadmin)
router.post(
    '/',
    authMiddleware,
    superAdminMiddleware,
    asyncHandler(configurationController.createConfiguration.bind(configurationController))
);

router.put(
    '/:id',
    authMiddleware,
    superAdminMiddleware,
    asyncHandler(configurationController.updateConfiguration.bind(configurationController))
);

export default router;
