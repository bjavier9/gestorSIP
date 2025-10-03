
import { Router } from 'express';
import container from '../config/container';
import { TYPES } from '../config/types';
import { OficinaController } from '../infrastructure/http/oficina.controller';
import asyncHandler from 'express-async-handler';
import { authMiddleware, authorizeCompaniaAccess } from '../middleware/authMiddleware';

const router = Router({ mergeParams: true });
const oficinaController = container.get<OficinaController>(TYPES.OficinaController);

// Middleware de autorización para las rutas de oficinas
const authorize = authorizeCompaniaAccess(['admin', 'supervisor']);

router.post('/', authMiddleware, authorize, asyncHandler(oficinaController.createOficina.bind(oficinaController)));
router.get('/', authMiddleware, authorize, asyncHandler(oficinaController.getOficinas.bind(oficinaController)));
router.get('/:oficinaId', authMiddleware, authorize, asyncHandler(oficinaController.getOficinaById.bind(oficinaController)));
router.put('/:oficinaId', authMiddleware, authorize, asyncHandler(oficinaController.updateOficina.bind(oficinaController)));
router.delete('/:oficinaId', authMiddleware, authorize, asyncHandler(oficinaController.deleteOficina.bind(oficinaController)));

export default router;
