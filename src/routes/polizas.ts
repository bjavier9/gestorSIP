import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import container from '../config/container';
import { TYPES } from '../config/types';
import { PolizaController } from '../infrastructure/http/poliza.controller';

const router = Router();
const polizaController = container.get<PolizaController>(TYPES.PolizaController);

router.get('/', asyncHandler(polizaController.getAll.bind(polizaController)));
router.get('/:id', asyncHandler(polizaController.getById.bind(polizaController)));

export default router;
