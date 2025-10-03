
import { Router } from 'express';
import container from '../config/container';
import { TYPES } from '../config/types';
import { AseguradoraController } from '../infrastructure/http/aseguradora.controller';
import { authMiddleware, adminSupervisorOrSuperadminMiddleware } from '../middleware/authMiddleware';
import asyncHandler from 'express-async-handler';

const router = Router();
const aseguradoraController = container.get<AseguradoraController>(TYPES.AseguradoraController);

router.get('/', authMiddleware, asyncHandler(aseguradoraController.getAll.bind(aseguradoraController)));
router.get('/:id', authMiddleware, asyncHandler(aseguradoraController.getById.bind(aseguradoraController)));
router.post('/', authMiddleware, adminSupervisorOrSuperadminMiddleware, asyncHandler(aseguradoraController.create.bind(aseguradoraController)));
router.put('/:id', authMiddleware, adminSupervisorOrSuperadminMiddleware, asyncHandler(aseguradoraController.update.bind(aseguradoraController)));

export default router;
