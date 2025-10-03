import { Router } from 'express';
import container from '../config/container';
import { TYPES } from '../config/types';
import { OficinaController } from '../infrastructure/http/oficina.controller';
import asyncHandler from 'express-async-handler';
import { authMiddleware, authorizeCompaniaAccess } from '../middleware/authMiddleware';

const router = Router({ mergeParams: true });
const oficinaController = container.get<OficinaController>(TYPES.OficinaController);

// Middleware de autorizacion para las rutas de oficinas
const authorize = authorizeCompaniaAccess(['admin', 'supervisor']);

/**
 * @swagger
 * /api/companias/{companiaId}/oficinas:
 *   post:
 *     tags: [Oficinas]
 *     summary: Crear una nueva oficina
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companiaId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOficinaRequest'
 *     responses:
 *       201:
 *         description: Oficina creada exitosamente.
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
 *                         data: { $ref: '#/components/schemas/Oficina' }
 *                         message: { type: string }
 *       400:
 *         description: Datos de entrada invalidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', authMiddleware, authorize, asyncHandler(oficinaController.createOficina.bind(oficinaController)));

/**
 * @swagger
 * /api/companias/{companiaId}/oficinas:
 *   get:
 *     tags: [Oficinas]
 *     summary: Listar oficinas de la compania
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companiaId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista de oficinas.
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
 *                           items: { $ref: '#/components/schemas/Oficina' }
 *                         message: { type: string }
 */
router.get('/', authMiddleware, authorize, asyncHandler(oficinaController.getOficinas.bind(oficinaController)));

/**
 * @swagger
 * /api/companias/{companiaId}/oficinas/{oficinaId}:
 *   get:
 *     tags: [Oficinas]
 *     summary: Obtener detalles de una oficina
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companiaId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: oficinaId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Oficina encontrada.
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
 *                         data: { $ref: '#/components/schemas/Oficina' }
 *                         message: { type: string }
 *       404:
 *         description: Oficina no encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:oficinaId', authMiddleware, authorize, asyncHandler(oficinaController.getOficinaById.bind(oficinaController)));

/**
 * @swagger
 * /api/companias/{companiaId}/oficinas/{oficinaId}:
 *   put:
 *     tags: [Oficinas]
 *     summary: Actualizar una oficina
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companiaId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: oficinaId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOficinaRequest'
 *     responses:
 *       200:
 *         description: Oficina actualizada.
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
 *                         data: { $ref: '#/components/schemas/Oficina' }
 *                         message: { type: string }
 *       404:
 *         description: Oficina no encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:oficinaId', authMiddleware, authorize, asyncHandler(oficinaController.updateOficina.bind(oficinaController)));

/**
 * @swagger
 * /api/companias/{companiaId}/oficinas/{oficinaId}:
 *   delete:
 *     tags: [Oficinas]
 *     summary: Eliminar una oficina
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companiaId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: oficinaId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Oficina eliminada.
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
 *                             message: { type: string }
 *       404:
 *         description: Oficina no encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:oficinaId', authMiddleware, authorize, asyncHandler(oficinaController.deleteOficina.bind(oficinaController)));

export default router;
