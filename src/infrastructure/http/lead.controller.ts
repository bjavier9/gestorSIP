
import { Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import { LeadService } from '../../application/lead.service';
import { TYPES } from '../../config/types';
import { AuthenticatedRequest } from '../../utils/AuthenticatedRequest';
import { ApiError } from '../../utils/ApiError';

@injectable()
export class LeadController {

    constructor(
        @inject(TYPES.LeadService) private leadService: LeadService
    ) { }

    public async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { nombre, correo, telefono, origen, estado } = req.body;
            const companiaCorretajeId = req.companiaCorretajeId;

            if (!companiaCorretajeId) {
                throw new ApiError('BAD_REQUEST', 'ID de la compañía de corretaje no proporcionado.');
            }

            const newLead = await this.leadService.createLead({
                nombre,
                correo,
                telefono,
                origen,
                companiaCorretajeId,
                estado: estado || 'nuevo',
            });
            res.status(201).json(newLead);
        } catch (error) {
            next(error);
        }
    }

    public async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const companiaCorretajeId = req.companiaCorretajeId;
            if (!companiaCorretajeId) {
                throw new ApiError('BAD_REQUEST', 'ID de la compañía de corretaje no proporcionado.');
            }
            const leads = await this.leadService.getLeadsByCompania(companiaCorretajeId);
            res.status(200).json(leads);
        } catch (error) {
            next(error);
        }
    }

    public async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const lead = await this.leadService.getLeadById(req.params.id);
            if (!lead) {
                throw new ApiError('NOT_FOUND', 'Lead no encontrado.');
            }
            // Security check: Ensure the lead belongs to the user's company
            if (lead.companiaCorretajeId !== req.companiaCorretajeId) {
                throw new ApiError('FORBIDDEN', 'No tienes permiso para acceder a este lead.');
            }
            res.status(200).json(lead);
        } catch (error) {
            next(error);
        }
    }

    public async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const leadId = req.params.id;
            // First, verify the lead belongs to the company before updating
            const existingLead = await this.leadService.getLeadById(leadId);
            if (!existingLead || existingLead.companiaCorretajeId !== req.companiaCorretajeId) {
                throw new ApiError('FORBIDDEN', 'No tienes permiso para modificar este lead.');
            }

            const updatedLead = await this.leadService.updateLead(leadId, req.body);
            res.status(200).json(updatedLead);
        } catch (error) {
            next(error);
        }
    }

    public async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const leadId = req.params.id;
            // First, verify the lead belongs to the company before deleting
            const existingLead = await this.leadService.getLeadById(leadId);
            if (!existingLead || existingLead.companiaCorretajeId !== req.companiaCorretajeId) {
                 throw new ApiError('FORBIDDEN', 'No tienes permiso para eliminar este lead.');
            }

            await this.leadService.deleteLead(leadId);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
