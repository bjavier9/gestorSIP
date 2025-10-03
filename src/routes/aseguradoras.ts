import { Router } from 'express';
import container from '../config/container';
import { TYPES } from '../config/types';
import { AseguradoraController } from '../infrastructure/http/aseguradora.controller';
import { authMiddleware, adminSupervisorOrSuperadminMiddleware } from '../middleware/authMiddleware';
import asyncHandler from 'express-async-handler';

const router = Router();
const aseguradoraController = container.get<AseguradoraController>(TYPES.AseguradoraController);

/**
 * @swagger
 * /api/aseguradoras:
 *   get:
 *     tags: [Aseguradoras]
 *     summary: Listar aseguradoras
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de aseguradoras.
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
 *                             $ref: '#/components/schemas/Aseguradora'
 */
router.get('/', authMiddleware, asyncHandler(aseguradoraController.getAll.bind(aseguradoraController)));

/**
 * @swagger
 * /api/aseguradoras/{id}:
 *   get:
 *     tags: [Aseguradoras]
 *     summary: Obtener aseguradora por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Aseguradora encontrada.
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
 *                           $ref: '#/components/schemas/Aseguradora'
 *       404:
 *         description: Aseguradora no encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', authMiddleware, asyncHandler(aseguradoraController.getById.bind(aseguradoraController)));

/**
 * @swagger
 * /api/aseguradoras:
 *   post:
 *     tags: [Aseguradoras]
 *     summary: Crear aseguradora
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAseguradoraRequest'
 *     responses:
 *       201:
 *         description: Aseguradora creada.
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
 *                           $ref: '#/components/schemas/Aseguradora'
 *       400:
 *         description: Datos invalidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', authMiddleware, adminSupervisorOrSuperadminMiddleware, asyncHandler(aseguradoraController.create.bind(aseguradoraController)));

/**
 * @swagger
 * /api/aseguradoras/{id}:
 *   put:
 *     tags: [Aseguradoras]
 *     summary: Actualizar aseguradora
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
 *             $ref: '#/components/schemas/UpdateAseguradoraRequest'
 *     responses:
 *       200:
 *         description: Aseguradora actualizada.
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
 *                           $ref: '#/components/schemas/Aseguradora'
 *       404:
 *         description: Aseguradora no encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', authMiddleware, adminSupervisorOrSuperadminMiddleware, asyncHandler(aseguradoraController.update.bind(aseguradoraController)));

export default router;
