import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { EnteController } from '../infrastructure/http/ente.controller';

/**
 * @swagger
 * components:
 *   schemas:
 *     Ente:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The unique identifier for the entity.
 *           example: "k2Lh5g8A..."
 *         name:
 *           type: string
 *           description: The name of the entity.
 *           example: "John Doe"
 *         type:
 *           type: string
 *           description: The type of the entity (e.g., client, agent).
 *           example: "cliente"
 *         email:
 *           type: string
 *           description: The email of the entity.
 *           example: "john.doe@example.com"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp of when the entity was created.
 *     EnteInput:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - email
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the entity.
 *           example: "Jane Doe"
 *         type:
 *           type: string
 *           description: The type of the entity.
 *           example: "agente"
 *         email:
 *           type: string
 *           description: The email of the entity.
 *           example: "jane.doe@example.com"
 */
export const createEnteRouter = (enteController: EnteController): Router => {
    const router = Router();

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
     *             $ref: '#/components/schemas/EnteInput'
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

    return router;
};
