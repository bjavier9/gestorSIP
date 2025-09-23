
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { EnteController } from '../infrastructure/http/ente.controller';
import { authMiddleware } from '../middleware/authMiddleware';
import container from '../config/container'; // Corrected import
import { TYPES } from '../config/types';

// The EnteController is resolved from the container
const enteController = container.get<EnteController>(TYPES.EnteController);

const router = Router();

// All routes in this module require authentication.
router.use(authMiddleware);

/**
 * @swagger
 * /api/entes:
 *   get:
 *     summary: Retrieve a list of all entities
 *     tags: [Entes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of entities.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ente'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', asyncHandler(enteController.getAll.bind(enteController)));

/**
 * @swagger
 * /api/entes/{id}:
 *   get:
 *     summary: Get a single entity by ID
 *     tags: [Entes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The entity ID
 *     responses:
 *       200:
 *         description: The entity object.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ente'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Entity not found
 */
router.get('/:id', asyncHandler(enteController.getById.bind(enteController)));

/**
 * @swagger
 * /api/entes:
 *   post:
 *     summary: Create a new entity
 *     tags: [Entes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EnteInput'
 *     responses:
 *       201:
 *         description: Entity created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ente'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: An entity with this document number already exists.
 */
router.post('/', asyncHandler(enteController.create.bind(enteController)));

/**
 * @swagger
 * /api/entes/{id}:
 *   put:
 *     summary: Update an existing entity
 *     tags: [Entes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The entity ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EnteUpdateInput'
 *     responses:
 *       200:
 *         description: Entity updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ente'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Entity not found
 */
router.put('/:id', asyncHandler(enteController.update.bind(enteController)));

/**
 * @swagger
 * /api/entes/{id}:
 *   delete:
 *     summary: Delete an entity by ID
 *     tags: [Entes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The entity ID
 *     responses:
 *       204:
 *         description: Entity deleted successfully.
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Entity not found
 */
router.delete('/:id', asyncHandler(enteController.delete.bind(enteController)));

export default router;
