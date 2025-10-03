
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { OficinaService } from '../../application/oficina.service';
import { TYPES } from '../../config/types';
import { responseHandler } from '../../utils/responseHandler';

/**
 * @swagger
 * tags:
 *   name: Oficinas
 *   description: Gestión de oficinas para compañías de corretaje
 */
@injectable()
export class OficinaController {
  constructor(@inject(TYPES.OficinaService) private oficinaService: OficinaService) {}

  /**
   * @swagger
   * /api/companias/{companiaId}/oficinas:
   *   post:
   *     tags: [Oficinas]
   *     summary: Crear una nueva oficina para una compañía
   *     parameters:
   *       - in: path
   *         name: companiaId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID de la compañía de corretaje
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               nombre:
   *                 type: string
   *               direccion:
   *                 type: string
   *               telefono:
   *                 type: string
   *               moneda:
   *                 type: string
   *               activo:
   *                 type: boolean
   *     responses:
   *       201: { description: 'Oficina creada exitosamente' }
   *       400: { description: 'Datos de entrada inválidos' }
   */
  async createOficina(req: Request, res: Response): Promise<void> {
    const { companiaId } = req.params;
    const oficinaData = { ...req.body, companiaCorretajeId: companiaId };
    const oficina = await this.oficinaService.createOficina(oficinaData);
    responseHandler(res, { data: oficina, message: 'Oficina creada exitosamente.', status: 201 });
  }

  /**
   * @swagger
   * /api/companias/{companiaId}/oficinas:
   *   get:
   *     tags: [Oficinas]
   *     summary: Obtener todas las oficinas de una compañía
   *     parameters:
   *       - in: path
   *         name: companiaId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID de la compañía de corretaje
   *     responses:
   *       200: { description: 'Lista de oficinas' }
   */
  async getOficinas(req: Request, res: Response): Promise<void> {
    const { companiaId } = req.params;
    const oficinas = await this.oficinaService.getOficinas(companiaId);
    responseHandler(res, { data: oficinas, message: 'Oficinas recuperadas exitosamente.' });
  }

  /**
   * @swagger
   * /api/companias/{companiaId}/oficinas/{oficinaId}:
   *   get:
   *     tags: [Oficinas]
   *     summary: Obtener una oficina específica
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
   *       200: { description: 'Detalles de la oficina' }
   *       404: { description: 'Oficina no encontrada' }
   */
  async getOficinaById(req: Request, res: Response): Promise<void> {
    const { companiaId, oficinaId } = req.params;
    const oficina = await this.oficinaService.getOficinaById(companiaId, oficinaId);
    responseHandler(res, { data: oficina, message: 'Oficina recuperada exitosamente.' });
  }

  /**
   * @swagger
   * /api/companias/{companiaId}/oficinas/{oficinaId}:
   *   put:
   *     tags: [Oficinas]
   *     summary: Actualizar una oficina
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
   *             type: object
   *             properties:
   *               nombre:
   *                 type: string
   *               direccion:
   *                 type: string
   *               telefono:
   *                 type: string
   *               moneda:
   *                 type: string
   *               activo:
   *                 type: boolean
   *     responses:
   *       200: { description: 'Oficina actualizada' }
   *       404: { description: 'Oficina no encontrada' }
   */
  async updateOficina(req: Request, res: Response): Promise<void> {
    const { companiaId, oficinaId } = req.params;
    const oficina = await this.oficinaService.updateOficina(companiaId, oficinaId, req.body);
    responseHandler(res, { data: oficina, message: 'Oficina actualizada exitosamente.' });
  }

  /**
   * @swagger
   * /api/companias/{companiaId}/oficinas/{oficinaId}:
   *   delete:
   *     tags: [Oficinas]
   *     summary: Eliminar una oficina
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
   *       200: { description: 'Oficina eliminada' }
   *       404: { description: 'Oficina no encontrada' }
   */
  async deleteOficina(req: Request, res: Response): Promise<void> {
    const { companiaId, oficinaId } = req.params;
    await this.oficinaService.deleteOficina(companiaId, oficinaId);
    responseHandler(res, { message: 'Oficina eliminada exitosamente.' });
  }
}
