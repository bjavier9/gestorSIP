import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { CompaniaCorretajeController } from '../infrastructure/http/companiaCorretaje.controller';
import { authMiddleware, superAdminMiddleware } from '../middleware/authMiddleware';
import container from '../config/container';
import { TYPES } from '../config/types';

const companiaController = container.get<CompaniaCorretajeController>(TYPES.CompaniaCorretajeController);

const router = Router();

/**
 * @swagger
 * /api/companias:
 *   post:
 *     tags: [Compañías de Corretaje]
 *     summary: Create a new Brokerage Company
 *     description: Creates a new brokerage company. This endpoint is restricted to Super Admins.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCompaniaRequest'
 *     responses:
 *       201:
 *         description: Company created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompaniaCorretaje'
 *       400:
 *         description: Missing required fields.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
router.post('/', authMiddleware, superAdminMiddleware, asyncHandler(companiaController.create.bind(companiaController)));

export default router;
