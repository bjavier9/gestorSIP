import { Router } from 'express';
import container from '../config/container';
import { TYPES } from '../config/types';
import { ConfigurationController } from '../infrastructure/http/configuration.controller';
import { authMiddleware, superAdminMiddleware } from '../middleware/authMiddleware';
import asyncHandler from 'express-async-handler';

const router = Router();
const configurationController = container.get<ConfigurationController>(TYPES.ConfigurationController);

/**
 * @swagger
 * /api/configurations:
 *   get:
 *     tags: [Configurations]
 *     summary: Obtener todas las configuraciones
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todas las configuraciones.
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
 *                             $ref: '#/components/schemas/Configuration'
 *       401:
 *         description: No autorizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
    '/',
    authMiddleware,
    asyncHandler(configurationController.getAllConfigurations.bind(configurationController))
);

/**
 * @swagger
 * /api/configurations/{id}:
 *   get:
 *     tags: [Configurations]
 *     summary: Obtener una configuracion por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID de la configuracion (por ejemplo "roles").
 *     responses:
 *       200:
 *         description: Detalles de la configuracion.
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
 *                           $ref: '#/components/schemas/Configuration'
 *       401:
 *         description: No autorizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Configuracion no encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
    '/:id',
    authMiddleware,
    asyncHandler(configurationController.getConfigurationById.bind(configurationController))
);

/**
 * @swagger
 * /api/configurations:
 *   post:
 *     tags: [Configurations]
 *     summary: Crear una nueva configuracion (solo Superadmin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConfigurationCreateRequest'
 *     responses:
 *       201:
 *         description: Configuracion creada exitosamente.
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
 *                           $ref: '#/components/schemas/Configuration'
 *       400:
 *         description: Datos de entrada invalidos.
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
 *       403:
 *         description: Acceso denegado. Requiere rol de Superadmin.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Ya existe una configuracion con ese ID.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
    '/',
    authMiddleware,
    superAdminMiddleware,
    asyncHandler(configurationController.createConfiguration.bind(configurationController))
);

/**
 * @swagger
 * /api/configurations/{id}:
 *   put:
 *     tags: [Configurations]
 *     summary: Actualizar una configuracion existente (solo Superadmin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID de la configuracion a actualizar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConfigurationUpdateRequest'
 *     responses:
 *       200:
 *         description: Configuracion actualizada exitosamente.
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
 *                           $ref: '#/components/schemas/Configuration'
 *       400:
 *         description: Datos de entrada invalidos.
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
 *       403:
 *         description: Acceso denegado. Requiere rol de Superadmin.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Configuracion no encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
    '/:id',
    authMiddleware,
    superAdminMiddleware,
    asyncHandler(configurationController.updateConfiguration.bind(configurationController))
);

export default router;
