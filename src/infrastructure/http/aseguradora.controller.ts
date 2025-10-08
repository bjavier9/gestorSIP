import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { AseguradoraService } from '../../application/aseguradora.service';
import { TYPES } from '../../di/types';
import { handleSuccess } from '../../utils/responseHandler';
import { ApiError } from '../../utils/ApiError';

/**
 * @swagger
 * tags:
 *   name: Aseguradoras
 *   description: Gestion de catalogo de aseguradoras.
 */
@injectable()
export class AseguradoraController {
    constructor(
        @inject(TYPES.AseguradoraService) private aseguradoraService: AseguradoraService
    ) {}

    /**
     * @swagger
     * /api/aseguradoras:
     *   get:
     *     tags: [Aseguradoras]
     *     summary: Lista todas las aseguradoras disponibles.
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Listado de aseguradoras.
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
     *       401:
     *         description: Token invalido o ausente.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    async getAll(req: Request, res: Response): Promise<void> {
        const aseguradoras = await this.aseguradoraService.getAllAseguradoras();
        handleSuccess(req, res, aseguradoras);
    }

    async getById(req: Request, res: Response): Promise<void> {
        const aseguradora = await this.aseguradoraService.getAseguradoraById(req.params.id);
        if (!aseguradora) {
            throw new ApiError('NOT_FOUND', `Aseguradora with id ${req.params.id} not found`, 404);
        }
        handleSuccess(req, res, aseguradora);
    }

    async create(req: Request, res: Response): Promise<void> {
        const newAseguradora = await this.aseguradoraService.createAseguradora(req.body);
        handleSuccess(req, res, newAseguradora, 201);
    }

    async update(req: Request, res: Response): Promise<void> {
        const updatedAseguradora = await this.aseguradoraService.updateAseguradora(req.params.id, req.body);
        if (!updatedAseguradora) {
            throw new ApiError('NOT_FOUND', `Aseguradora with id ${req.params.id} not found`, 404);
        }
        handleSuccess(req, res, updatedAseguradora);
    }
}
