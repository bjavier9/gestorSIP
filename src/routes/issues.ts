

// src/routes/issues.ts
import { Router } from 'express';
import { Container } from 'inversify';
import { IssueController } from '../infrastructure/http/issue.controller';
import { TYPES } from '../di/types';
import { asyncHandler } from '../middleware/asyncHandler';
// import { authMiddleware } from '../middleware/authMiddleware';

export const createIssueRoutes = (container: Container): Router => {
    const router = Router();
    const controller = container.get<IssueController>(TYPES.IssueController);


    /**
     * @swagger
     * /api/issues/{id}:
     *   get:
     *     tags: [Issues]
     *     summary: Obtener detalles de un issue por ID
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Issue encontrado
     *       404:
     *         description: Issue no encontrado
     */
    router.get('/:id', asyncHandler(controller.getById.bind(controller)));


    return router;
};
