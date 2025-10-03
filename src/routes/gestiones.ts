import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import container from '../config/container';
import { TYPES } from '../config/types';
import { GestionController } from '../infrastructure/http/gestion.controller';
import { agentSupervisorMiddleware, authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const getController = () => container.get<GestionController>(TYPES.GestionController);

/**
 * @swagger
 * /api/gestiones:
 *   get:
 *     tags: [Gestiones]
 *     summary: Listar gestiones de la compania
 *     description: Devuelve todas las gestiones asociadas a la compania del usuario autenticado.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de gestiones.
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
 *                             $ref: '#/components/schemas/Gestion'
 */
router.get('/', authMiddleware, asyncHandler((req, res, next) => {
  getController().list(req, res, next);
}));

/**
 * @swagger
 * /api/gestiones/{id}:
 *   get:
 *     tags: [Gestiones]
 *     summary: Obtener gestion por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Gestion encontrada.
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
 *                           $ref: '#/components/schemas/Gestion'
 *       403:
 *         description: Acceso denegado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Gestion no encontrada.
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
 * /api/gestiones:
 *   post:
 *     tags: [Gestiones]
 *     summary: Crear una nueva gestion
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGestionRequest'
 *           examples:
 *             default:
 *               value:
 *                 tipo: "nueva"
 *                 estado: "en_gestion"
 *                 leadId: "lead_001"
 *                 prioridad: "alta"
 *                 notas: "Cliente solicito cotizacion con cobertura extendida"
 *                 fechaVencimiento: "2025-12-31T00:00:00.000Z"
 *     responses:
 *       201:
 *         description: Gestion creada.
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
 *                           $ref: '#/components/schemas/Gestion'
 *       400:
 *         description: Solicitud invalida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Rol no autorizado.
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
 * /api/gestiones/{id}:
 *   put:
 *     tags: [Gestiones]
 *     summary: Actualizar una gestion
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
 *             $ref: '#/components/schemas/UpdateGestionRequest'
 *     responses:
 *       200:
 *         description: Gestion actualizada.
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
 *                           $ref: '#/components/schemas/Gestion'
 *       403:
 *         description: Rol no autorizado o compania incorrecta.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Gestion no encontrada.
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
 * /api/gestiones/{id}:
 *   delete:
 *     tags: [Gestiones]
 *     summary: Eliminar una gestion
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Gestion eliminada.
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
 *                             message: { type: string, example: "Gestion eliminada" }
 *       403:
 *         description: Rol no autorizado o compania incorrecta.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Gestion no encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', authMiddleware, agentSupervisorMiddleware, asyncHandler((req, res, next) => {
  getController().delete(req, res, next);
}));

export default router;
