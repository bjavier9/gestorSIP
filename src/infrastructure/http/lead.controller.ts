import { Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import { LeadService } from '../../application/lead.service';
import { TYPES } from '../../di/types';
import { AuthenticatedRequest } from '../../middleware/authentication.middleware';
import { ApiError } from '../../utils/ApiError';
import { handleSuccess } from '../../utils/responseHandler';

/**
 * @swagger
 * tags:
 *   name: Leads
 *   description: Gestion de leads comerciales por compania.
 */
@injectable()
export class LeadController {
  constructor(
    @inject(TYPES.LeadService) private leadService: LeadService,
  ) {}

  public async getLeadsByCompania(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { companiaId } = req.params;
      const leads = await this.leadService.getLeadsByCompania(companiaId);
      handleSuccess(req, res, leads);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/leads:
   *   post:
   *     tags: [Leads]
   *     summary: Crea un lead asociado a la compania del usuario.
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateLeadRequest'
   *     responses:
   *       201:
   *         description: Lead creado correctamente.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   *       400:
   *         description: Datos faltantes.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  public async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { nombre, correo, telefono, origen, estado } = req.body || {};
      const companiaCorretajeId = req.user?.user?.companiaCorretajeId;

      if (!companiaCorretajeId) {
        throw new ApiError('BAD_REQUEST', 'ID de la compania de corretaje no proporcionado.', 400);
      }

      if (!nombre || !correo || !telefono || !origen) {
        throw new ApiError('VALIDATION_MISSING_FIELDS', 'nombre, correo, telefono y origen son requeridos.', 400);
      }

      const newLead = await this.leadService.createLead({
        nombre,
        correo,
        telefono,
        origen,
        companiaCorretajeId,
        estado,
      });

      handleSuccess(req, res, newLead, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/leads:
   *   get:
   *     tags: [Leads]
   *     summary: Lista los leads de la compania del usuario.
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de leads.
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
   *                             $ref: '#/components/schemas/Lead'
   */
  public async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const companiaCorretajeId = req.user?.user?.companiaCorretajeId;
      if (!companiaCorretajeId) {
        throw new ApiError('BAD_REQUEST', 'ID de la compania de corretaje no proporcionado.', 400);
      }
      const leads = await this.leadService.getLeadsByCompania(companiaCorretajeId);
      handleSuccess(req, res, leads);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/leads/{id}:
   *   get:
   *     tags: [Leads]
   *     summary: Obtiene un lead por su identificador.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Identificador del lead.
   *     responses:
   *       200:
   *         description: Lead encontrado.
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
   *                           $ref: '#/components/schemas/Lead'
   *       403:
   *         description: El lead no pertenece a la compania.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  public async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const lead = await this.leadService.getLeadById(req.params.id);
      if (lead.companiaCorretajeId !== req.user?.user?.companiaCorretajeId) {
        throw new ApiError('FORBIDDEN', 'No tienes permiso para acceder a este lead.', 403);
      }
      handleSuccess(req, res, lead);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/leads/{id}:
   *   put:
   *     tags: [Leads]
   *     summary: Actualiza un lead existente.
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
   *             $ref: '#/components/schemas/UpdateLeadRequest'
   *     responses:
   *       200:
   *         description: Lead actualizado.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   *       403:
   *         description: No tienes permiso para modificar este lead.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  public async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const leadId = req.params.id;
      const existingLead = await this.leadService.getLeadById(leadId);
      if (existingLead.companiaCorretajeId !== req.user?.user?.companiaCorretajeId) {
        throw new ApiError('FORBIDDEN', 'No tienes permiso para modificar este lead.', 403);
      }

      const updatedLead = await this.leadService.updateLead(leadId, req.body);
      handleSuccess(req, res, updatedLead);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/leads/{id}:
   *   delete:
   *     tags: [Leads]
   *     summary: Elimina un lead.
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
   *         description: Lead eliminado.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   */
  public async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const leadId = req.params.id;
      const existingLead = await this.leadService.getLeadById(leadId);
      if (existingLead.companiaCorretajeId !== req.user?.user?.companiaCorretajeId) {
        throw new ApiError('FORBIDDEN', 'No tienes permiso para eliminar este lead.', 403);
      }

      await this.leadService.deleteLead(leadId);
      handleSuccess(req, res, { message: 'Lead eliminado' });
    } catch (error) {
      next(error);
    }
  }
}
