import { inject, injectable } from 'inversify';
import { GestionRepository, GestionCreateInput, GestionUpdateInput } from '../domain/ports/gestionRepository.port';
import { TYPES } from '../config/types';
import { Gestion, GestionEstado, GestionPrioridad, GestionTipo } from '../domain/gestion';
import { ApiError } from '../utils/ApiError';

interface CreateGestionDto {
  companiaCorretajeId: string;
  agenteId: string;
  oficinaId?: string;
  polizaId?: string;
  leadId?: string;
  enteId?: string;
  tipo: GestionTipo;
  estado?: GestionEstado;
  prioridad?: GestionPrioridad;
  notas?: string;
  fechaVencimiento?: Date;
  activo?: boolean;
}

interface UpdateGestionDto {
  leadId?: string | null;
  enteId?: string | null;
  agenteId?: string;
  oficinaId?: string;
  polizaId?: string;
  tipo?: GestionTipo;
  estado?: GestionEstado;
  prioridad?: GestionPrioridad;
  notas?: string;
  fechaVencimiento?: Date | null;
  activo?: boolean;
}

@injectable()
export class GestionService {
  constructor(
    @inject(TYPES.GestionRepository) private gestionRepository: GestionRepository
  ) {}

  private validateLeadOrEnte(leadId?: string | null, enteId?: string | null) {
    const hasLead = !!leadId;
    const hasEnte = !!enteId;
    if (!hasLead && !hasEnte) {
      throw new ApiError('GESTION_RELATION_REQUIRED', 'Debe asociar la gestion a un lead o a un ente.', 400);
    }
    if (hasLead && hasEnte) {
      throw new ApiError('GESTION_RELATION_CONFLICT', 'Una gestion no puede estar asociada simultaneamente a un lead y un ente.', 400);
    }
  }

  async createGestion(payload: CreateGestionDto): Promise<Gestion> {
    this.validateLeadOrEnte(payload.leadId, payload.enteId);

    const data: GestionCreateInput = {
      companiaCorretajeId: payload.companiaCorretajeId,
      agenteId: payload.agenteId,
      oficinaId: payload.oficinaId,
      polizaId: payload.polizaId,
      leadId: payload.leadId,
      enteId: payload.enteId,
      tipo: payload.tipo,
      estado: payload.estado ?? 'borrador',
      prioridad: payload.prioridad ?? 'media',
      notas: payload.notas,
      fechaVencimiento: payload.fechaVencimiento,
      activo: payload.activo ?? true,
    };

    return this.gestionRepository.create(data);
  }

  async getGestionesByCompania(companiaId: string): Promise<Gestion[]> {
    return this.gestionRepository.findAllByCompania(companiaId);
  }

  async getGestionById(id: string): Promise<Gestion> {
    const gestion = await this.gestionRepository.findById(id);
    if (!gestion) {
      throw new ApiError('GESTION_NOT_FOUND', 'Gestion no encontrada.', 404);
    }
    return gestion;
  }

  async updateGestion(id: string, updates: UpdateGestionDto): Promise<Gestion> {
    const existing = await this.gestionRepository.findById(id);
    if (!existing) {
      throw new ApiError('GESTION_NOT_FOUND', 'Gestion no encontrada.', 404);
    }

    const leadProvided = Object.prototype.hasOwnProperty.call(updates, 'leadId');
    const enteProvided = Object.prototype.hasOwnProperty.call(updates, 'enteId');
    if (leadProvided || enteProvided) {
      this.validateLeadOrEnte(
        leadProvided ? updates.leadId ?? null : existing.leadId ?? null,
        enteProvided ? updates.enteId ?? null : existing.enteId ?? null,
      );
    }

    const data: GestionUpdateInput = {
      ...updates,
      fechaActualizacion: new Date(),
    };

    return this.gestionRepository.update(id, data);
  }

  async deleteGestion(id: string): Promise<void> {
    const existing = await this.gestionRepository.findById(id);
    if (!existing) {
      throw new ApiError('GESTION_NOT_FOUND', 'Gestion no encontrada.', 404);
    }
    await this.gestionRepository.delete(id);
  }
}
