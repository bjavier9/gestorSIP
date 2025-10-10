import { Response } from 'express';
import { inject, injectable } from 'inversify';
import { EnteService } from '../../application/ente.service';
import { TYPES } from '../../di/types';
import { handleSuccess } from '../../utils/responseHandler';
import { ApiError } from '../../utils/ApiError';
import { AuthenticatedRequest } from '../../middleware/authentication.middleware';

/**
 * @swagger
 * tags:
 *   name: Entes
 *   description: Gestion de entes asociados a la compania del usuario.
 */
@injectable()
export class EnteController {
  constructor(@inject(TYPES.EnteService) private enteService: EnteService) {}

  private getCompaniaId(req: AuthenticatedRequest): string {
    const companiaId = req.user?.user?.companiaCorretajeId;
    if (!companiaId) {
      throw new ApiError('FORBIDDEN', 'No se pudo determinar la compania asociada al token.', 403);
    }
    return companiaId;
  }

  /**
   * @swagger
   * /api/entes:
   *   post:
   *     tags: [Entes]
   *     summary: Crea un ente vinculado a la compania del usuario autenticado.
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
   *         description: Ente creado.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   *       403:
   *         description: El token no contiene la compania asociada.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    const companiaId = this.getCompaniaId(req);
    const ente = await this.enteService.create(companiaId, req.body);
    handleSuccess(req, res, ente, 201);
  }

  /**
   * @swagger
   * /api/entes/{id}:
   *   get:
   *     tags: [Entes]
   *     summary: Obtiene un ente por su identificador.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Identificador del ente.
   *     responses:
   *       200:
   *         description: Ente encontrado.
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
   *                           $ref: '#/components/schemas/Ente'
   *       404:
   *         description: Ente no encontrado.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const companiaId = this.getCompaniaId(req);
    const ente = await this.enteService.getById(req.params.id, companiaId);
    if (!ente) {
      throw new ApiError('ENTE_NOT_FOUND', 'Ente no encontrado', 404);
    }
    handleSuccess(req, res, ente);
  }

  /**
   * @swagger
   * /api/entes:
   *   get:
   *     tags: [Entes]
   *     summary: Lista todos los entes vinculados a la compania del usuario.
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Listado de entes.
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
   *                             $ref: '#/components/schemas/Ente'
   */
  async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    const companiaId = this.getCompaniaId(req);
    const entes = await this.enteService.getAll(companiaId);
    handleSuccess(req, res, entes);
  }

  /**
   * @swagger
   * /api/entes/{id}:
   *   put:
   *     tags: [Entes]
   *     summary: Actualiza un ente existente.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/EnteUpdateInput'
   *     responses:
   *       200:
   *         description: Ente actualizado.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   *       404:
   *         description: Ente no encontrado.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    const companiaId = this.getCompaniaId(req);
    const ente = await this.enteService.update(req.params.id, companiaId, req.body);
    if (!ente) {
        throw new ApiError('ENTE_NOT_FOUND', 'Ente no encontrado para actualizar', 404);
    }
    handleSuccess(req, res, ente);
  }

  /**
   * @swagger
   * /api/entes/{id}:
   *   delete:
   *     tags: [Entes]
   *     summary: Elimina un ente.
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
   *         description: Ente eliminado correctamente.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   */
  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    const companiaId = this.getCompaniaId(req);
    const result = await this.enteService.delete(req.params.id, companiaId);
    handleSuccess(req, res, result);
  }
}
