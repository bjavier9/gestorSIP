import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import container from '../config/container';
import { TYPES } from '../config/types';
import { LeadController } from '../infrastructure/http/lead.controller';
import { agentSupervisorMiddleware, authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Lazy-load the controller inside the route handler to prevent circular dependency issues at startup.
const getController = () => container.get<LeadController>(TYPES.LeadController);

/**
 * @swagger
 * /api/leads:
 *   get:
 *     tags: [Leads]
 *     summary: Listar leads de la compania
 *     description: Retorna los leads asociados a la compania del token JWT.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de leads.
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
 */
router.get('/', authMiddleware, asyncHandler((req, res, next) => {
  getController().getAll(req, res, next);
}));

/**
 * @swagger
 * /api/leads/{id}:
 *   get:
 *     tags: [Leads]
 *     summary: Obtener lead por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lead encontrado.
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
 *                           $ref: '#/components/schemas/Lead'
 *       403:
 *         description: Prohibido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Lead no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', authMiddleware, asyncHandler((req, res, next) => {
  getController().getById(req, res, next);
}));

/**
 * @swagger
 * /api/leads:
 *   post:
 *     tags: [Leads]
 *     summary: Crear lead
 *     description: Crea un lead dentro de la compania del usuario (se infiere del token).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateLeadRequest'
 *           examples:
 *             default:
 *               value:
 *                 nombre: "Juan Perez"
 *                 correo: "juan@example.com"
 *                 telefono: "+58-412-5556677"
 *                 origen: "web"
 *     responses:
 *       201:
 *         description: Lead creado.
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
 *                           $ref: '#/components/schemas/Lead'
 *       400:
 *         description: Solicitud invalida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autorizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', authMiddleware, agentSupervisorMiddleware, asyncHandler((req, res, next) => {
  getController().create(req, res, next);
}));

/**
 * @swagger
 * /api/leads/{id}:
 *   put:
 *     tags: [Leads]
 *     summary: Actualizar lead
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateLeadRequest'
 *     responses:
 *       200:
 *         description: Lead actualizado.
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
 *                           $ref: '#/components/schemas/Lead'
 *       403:
 *         description: Prohibido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Lead no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', authMiddleware, agentSupervisorMiddleware, asyncHandler((req, res, next) => {
  getController().update(req, res, next);
}));

/**
 * @swagger
 * /api/leads/{id}:
 *   delete:
 *     tags: [Leads]
 *     summary: Eliminar lead
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lead eliminado.
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
 *                           type: object
 *                           properties:
 *                             message: { type: string, example: "Lead eliminado" }
 *       403:
 *         description: Prohibido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Lead no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', authMiddleware, agentSupervisorMiddleware, asyncHandler((req, res, next) => {
  getController().delete(req, res, next);
}));

export default router;
