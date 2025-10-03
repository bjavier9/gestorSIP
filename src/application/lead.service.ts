import { inject, injectable } from 'inversify';
import { LeadRepository } from '../domain/ports/leadRepository.port';
import { TYPES } from '../config/types';
import { Lead } from '../domain/lead';
import { ApiError } from '../utils/ApiError';

@injectable()
export class LeadService {
    constructor(
        @inject(TYPES.LeadRepository) private leadRepository: LeadRepository
    ) {}

    async createLead(leadData: Omit<Lead, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Promise<Lead> {
        return this.leadRepository.create(leadData);
    }

    async getLeadsByCompania(companiaId: string): Promise<Lead[]> {
        return this.leadRepository.findAllByCompania(companiaId);
    }

    async getLeadById(id: string): Promise<Lead | null> {
        const lead = await this.leadRepository.findById(id);
        if (!lead) {
            throw new ApiError('NOT_FOUND', 'Lead not found.', 404);
        }
        return lead;
    }

    async updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
        const existingLead = await this.leadRepository.findById(id);
        if (!existingLead) {
            throw new ApiError('NOT_FOUND', 'Lead not found.', 404);
        }
        return this.leadRepository.update(id, updates);
    }

    async deleteLead(id: string): Promise<void> {
        const existingLead = await this.leadRepository.findById(id);
        if (!existingLead) {
            throw new ApiError('NOT_FOUND', 'Lead not found.', 404);
        }
        return this.leadRepository.delete(id);
    }
}
