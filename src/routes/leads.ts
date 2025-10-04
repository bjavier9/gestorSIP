import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import container from '../config/container';
import { TYPES } from '../config/types';
import { LeadController } from '../infrastructure/http/lead.controller';
import { agentSupervisorMiddleware, authMiddleware } from '../middleware/authMiddleware';

const router = Router();

const getController = () => container.get<LeadController>(TYPES.LeadController);

router.get('/', authMiddleware, asyncHandler((req, res, next) => {
  getController().getAll(req, res, next);
}));

/**
 * @swagger
 * /api/leads/compania/{companiaId}:
 *   get:
 *     tags: [Leads]
 *     summary: Listar leads por ID de Compañía
 *     description: Retorna todos los leads para un ID de compañía de corretaje específico. Requiere permisos de supervisor.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companiaId
 *         required: true
 *         schema: { type: string }
 *         description: El ID de la compañía de corretaje.
 *     responses:
 *       200:
 *         description: Lista de leads para la compañía.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     body:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Lead'
 *       403:
 *         description: Prohibido. El usuario no tiene permisos.
 *       404:
 *         description: Compañía no encontrada.
 */
router.get('/compania/:companiaId', authMiddleware, agentSupervisorMiddleware, asyncHandler((req, res, next) => {
    getController().getLeadsByCompania(req, res, next);
}));

router.get('/:id', authMiddleware, asyncHandler((req, res, next) => {
  getController().getById(req, res, next);
}));

router.post('/', authMiddleware, agentSupervisorMiddleware, asyncHandler((req, res, next) => {
  getController().create(req, res, next);
}));

router.put('/:id', authMiddleware, agentSupervisorMiddleware, asyncHandler((req, res, next) => {
  getController().update(req, res, next);
}));

router.delete('/:id', authMiddleware, agentSupervisorMiddleware, asyncHandler((req, res, next) => {
  getController().delete(req, res, next);
}));

export default router;
