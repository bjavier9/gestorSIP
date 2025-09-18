import { Router } from 'express';
import { EnteController } from '../infrastructure/http/ente.controller';

export const createEnteRouter = (enteController: EnteController): Router => {
    const router = Router();

    /**
     * @swagger
     * /api/entes:
     *   post:
     *     summary: Create a new ente
     *     tags: [Entes]
     *     security: [{ bearerAuth: [] }]
     *     requestBody:
     *       required: true
     *       content: { "application/json": { schema: { $ref: '#/components/schemas/EnteInput' } } }
     *     responses:
     *       201: { description: "Ente created successfully" }
     *       400: { description: "Invalid input" }
     */
    router.post('/', enteController.create);

    /**
     * @swagger
     * /api/entes:
     *   get:
     *     summary: Get all entes
     *     tags: [Entes]
     *     security: [{ bearerAuth: [] }]
     *     responses:
     *       200: { description: "List of all entes" }
     */
    router.get('/', enteController.getAll);

    /**
     * @swagger
     * /api/entes/{id}:
     *   get:
     *     summary: Get an ente by ID
     *     tags: [Entes]
     *     security: [{ bearerAuth: [] }]
     *     parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }]
     *     responses:
     *       200: { description: "Ente found" }
     *       404: { description: "Ente not found" }
     */
    router.get('/:id', enteController.getById);
    
    /**
     * @swagger
     * /api/entes/{id}:
     *   patch:
     *     summary: Update an ente by ID
     *     tags: [Entes]
     *     security: [{ bearerAuth: [] }]
     *     parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }]
     *     requestBody:
     *       required: true
     *       content: { "application/json": { schema: { $ref: '#/components/schemas/EnteInput' } } }
     *     responses:
     *       200: { description: "Ente updated successfully" }
     *       404: { description: "Ente not found" }
     */
    router.patch('/:id', enteController.update);

    /**
     * @swagger
     * /api/entes/{id}:
     *   delete:
     *     summary: Delete an ente by ID
     *     tags: [Entes]
     *     security: [{ bearerAuth: [] }]
     *     parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }]
     *     responses:
     *       204: { description: "Ente deleted successfully" }
     *       404: { description: "Ente not found" }
     */
    router.delete('/:id', enteController.delete);

    return router;
};
