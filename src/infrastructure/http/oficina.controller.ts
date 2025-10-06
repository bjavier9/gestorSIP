import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { OficinaService } from '../../application/oficina.service';
import { TYPES } from '../../config/types';
import { handleSuccess } from '../../utils/responseHandler';

/**
 * @swagger
 * tags:
 *   name: Oficinas
 *   description: Gestion de oficinas para companias de corretaje
 */
@injectable()
export class OficinaController {
  constructor(@inject(TYPES.OficinaService) private oficinaService: OficinaService) {}

  /**
   * @swagger
   * /api/companias/{companiaId}/oficinas:
   *   post:
   *     tags: [Oficinas]
   *     summary: Crear una nueva oficina para una compania
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: companiaId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID de la compania de corretaje
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
   *                         data:
   *                           $ref: '#/components/schemas/Oficina'
   *                         message:
   *                           type: string
   *       400:
   *         description: Datos de entrada invalidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async create(req: Request, res: Response): Promise<void> {
    const { companiaId } = req.params;
    const oficinaData = { ...req.body, companiaCorretajeId: companiaId };
    const oficina = await this.oficinaService.createOficina(oficinaData);
    handleSuccess(req, res, oficina, 201, { message: 'Oficina creada exitosamente.' });
  }

  /**
   * @swagger
   * /api/companias/{companiaId}/oficinas:
   *   get:
   *     tags: [Oficinas]
   *     summary: Obtener todas las oficinas de una compania
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: companiaId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID de la compania de corretaje
   *     responses:
   *       200:
   *         description: Lista de oficinas
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
   *                             $ref: '#/components/schemas/Oficina'
   *                         message:
   *                           type: string
   */
  async getByCompania(req: Request, res: Response): Promise<void> {
    const { companiaId } = req.params;
    const oficinas = await this.oficinaService.getOficinas(companiaId);
    handleSuccess(req, res, oficinas, 200, { message: 'Oficinas recuperadas exitosamente.' });
  }

  /**
   * @swagger
   * /api/companias/{companiaId}/oficinas/{oficinaId}:
   *   get:
   *     tags: [Oficinas]
   *     summary: Obtener una oficina especifica
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: companiaId
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: oficinaId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Detalles de la oficina
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
   *                           $ref: '#/components/schemas/Oficina'
   *                         message:
   *                           type: string
   *       404:
   *         description: Oficina no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async getOficinaById(req: Request, res: Response): Promise<void> {
    const { companiaId, oficinaId } = req.params;
    const oficina = await this.oficinaService.getOficinaById(companiaId, oficinaId);
    handleSuccess(req, res, oficina, 200, { message: 'Oficina recuperada exitosamente.' });
  }

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
   *         schema:
   *           type: string
   *       - in: path
   *         name: oficinaId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateOficinaRequest'
   *     responses:
   *       200:
   *         description: Oficina actualizada
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
   *                           $ref: '#/components/schemas/Oficina'
   *                         message:
   *                           type: string
   *       404:
   *         description: Oficina no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async updateOficina(req: Request, res: Response): Promise<void> {
    const { companiaId, oficinaId } = req.params;
    const oficina = await this.oficinaService.updateOficina(companiaId, oficinaId, req.body);
    handleSuccess(req, res, oficina, 200, { message: 'Oficina actualizada exitosamente.' });
  }

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
   *         schema:
   *           type: string
   *       - in: path
   *         name: oficinaId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Oficina eliminada
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
   *                             message:
   *                               type: string
   *       404:
   *         description: Oficina no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async deleteOficina(req: Request, res: Response): Promise<void> {
    const { companiaId, oficinaId } = req.params;
    await this.oficinaService.deleteOficina(companiaId, oficinaId);
    handleSuccess(req, res, { message: 'Oficina eliminada exitosamente.' });
  }
}
