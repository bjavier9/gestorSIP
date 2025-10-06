import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { CompaniaCorretajeService } from '../../application/companiaCorretaje.service';
import { handleSuccess } from '../../utils/responseHandler';
import { TYPES } from '../../config/types';
import { ApiError } from '../../utils/ApiError';
import { CompaniaCorretaje } from '../../domain/companiaCorretaje';

/**
 * @swagger
 * tags:
 *   name: Companias
 *   description: Administracion de companias de corretaje.
 */
@injectable()
export class CompaniaCorretajeController {
  constructor(
    @inject(TYPES.CompaniaCorretajeService) private readonly companiaService: CompaniaCorretajeService
  ) {}

  /**
   * @swagger
   * /api/companias:
   *   post:
   *     tags: [Companias]
   *     summary: Crea una nueva compania de corretaje.
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CompaniaCorretaje'
   *     responses:
   *       201:
   *         description: Compania creada correctamente.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   *       400:
   *         description: Datos faltantes o invalidos.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async create(req: Request, res: Response) {
    const companiaData: CompaniaCorretaje = req.body;

    if (!companiaData.nombre || !companiaData.rif) {
      throw new ApiError('VALIDATION_MISSING_FIELD', 'Nombre and RIF are required.', 400);
    }

    const result = await this.companiaService.createCompania(companiaData);
    handleSuccess(req, res, result, 201);
  }

  /**
   * @swagger
   * /api/companias/{id}:
   *   get:
   *     tags: [Companias]
   *     summary: Obtiene una compania por su identificador.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Identificador de la compania.
   *     responses:
   *       200:
   *         description: Compania encontrada.
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
   *                           $ref: '#/components/schemas/CompaniaCorretaje'
   *       400:
   *         description: Falta el identificador.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: Compania no encontrada.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async getById(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
      throw new ApiError('VALIDATION_MISSING_FIELD', 'id is required.', 400);
    }
    const result = await this.companiaService.getCompaniaById(id);
    handleSuccess(req, res, result);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const data: Partial<CompaniaCorretaje> = req.body;

    if (!id) {
      throw new ApiError('VALIDATION_MISSING_FIELD', 'id is required.', 400);
    }

    const result = await this.companiaService.updateCompania(id, data);
    handleSuccess(req, res, result, 200);
  }

  async activar(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
      throw new ApiError('VALIDATION_MISSING_FIELD', 'id is required.', 400);
    }
    const result = await this.companiaService.activarCompania(id);
    handleSuccess(req, res, result, 200);
  }

  async desactivar(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
      throw new ApiError('VALIDATION_MISSING_FIELD', 'id is required.', 400);
    }
    const result = await this.companiaService.desactivarCompania(id);
    handleSuccess(req, res, result, 200);
  }
}
