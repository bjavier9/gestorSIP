import { Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import { LeadService } from '../../application/lead.service';
import { TYPES } from '../../config/types';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { ApiError } from '../../utils/ApiError';
import { handleSuccess } from '../../utils/responseHandler';

@injectable()
export class LeadController {
  constructor(
    @inject(TYPES.LeadService) private leadService: LeadService,
  ) {}

  // AÑADIDO: El método que faltaba para gestionar la ruta /compania/:companiaId
  public async getLeadsByCompania(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { companiaId } = req.params;
      const leads = await this.leadService.getLeadsByCompania(companiaId);
      handleSuccess(req, res, leads);
    } catch (error) {
      next(error);
    }
  }

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
