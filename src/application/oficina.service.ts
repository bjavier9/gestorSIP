
import { injectable, inject } from 'inversify';
import { OficinaRepository } from '../domain/ports/oficinaRepository.port';
import { TYPES } from '../di/types';
import { Oficina } from '../domain/entities/oficina';
import { ApiError } from '../utils/ApiError';

@injectable()
export class OficinaService {
  constructor(
    @inject(TYPES.OficinaRepository) private oficinaRepository: OficinaRepository
  ) {}

  async createOficina(data: Omit<Oficina, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Promise<Oficina> {
    if (!data.nombre || !data.companiaCorretajeId) {
      throw new ApiError('VALIDATION_ERROR', 'El nombre y el ID de la compañía son requeridos.', 400);
    }
    return this.oficinaRepository.create(data);
  }

  async getOficinas(companiaId: string): Promise<Oficina[]> {
    return this.oficinaRepository.findAll(companiaId);
  }

  async getOficinaById(companiaId: string, oficinaId: string): Promise<Oficina> {
    const oficina = await this.oficinaRepository.findById(companiaId, oficinaId);
    if (!oficina) {
      throw new ApiError('NOT_FOUND', 'Oficina no encontrada.', 404);
    }
    return oficina;
  }

  async updateOficina(companiaId: string, oficinaId: string, updates: Partial<Omit<Oficina, 'id' | 'companiaCorretajeId' | 'fechaCreacion'>>): Promise<Oficina> {
    const payload = { ...updates, companiaCorretajeId: companiaId } as Partial<Oficina>;
    const oficina = await this.oficinaRepository.update(oficinaId, payload);
    if (!oficina) {
      throw new ApiError('NOT_FOUND', 'Oficina no encontrada para actualizar.', 404);
    }
    return oficina;
  }

  async deleteOficina(companiaId: string, oficinaId: string): Promise<void> {
    const success = await this.oficinaRepository.delete(companiaId, oficinaId);
    if (!success) {
      throw new ApiError('NOT_FOUND', 'Oficina no encontrada para eliminar.', 404);
    }
  }
}
