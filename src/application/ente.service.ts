import { inject, injectable } from 'inversify';
import { EnteRepository, EnteInput, EnteUpdateInput } from '../domain/ports/enteRepository.port';
import { Ente } from '../domain/ente';
import { TYPES } from '../config/types';
import { ApiError } from '../utils/ApiError';

type CreateEnteDto = Omit<EnteInput, 'companiaCorretajeId'>;
type UpdateEnteDto = Omit<EnteUpdateInput, 'companiaCorretajeId'>;

@injectable()
export class EnteService {
  constructor(
    @inject(TYPES.EnteRepository) private enteRepository: EnteRepository
  ) {}

  async create(companiaCorretajeId: string, data: CreateEnteDto): Promise<Ente> {
    const payload: EnteInput = { ...data, companiaCorretajeId } as EnteInput;
    const existingEnte = await this.enteRepository.findByDocumento(payload.documento);
    if (existingEnte && existingEnte.companiaCorretajeId === companiaCorretajeId) {
      throw new ApiError('ENTE_ALREADY_EXISTS', 'Ya existe un ente con este documento para la compañía.', 409);
    }
    return this.enteRepository.save(payload);
  }

  async getById(id: string, companiaCorretajeId: string): Promise<Ente | null> {
    const ente = await this.enteRepository.findById(id);
    if (!ente) {
      return null;
    }
    if (ente.companiaCorretajeId !== companiaCorretajeId) {
      throw new ApiError('FORBIDDEN', 'No tienes permiso para acceder a este ente.', 403);
    }
    return ente;
  }

  async getAll(companiaCorretajeId: string): Promise<Ente[]> {
    return this.enteRepository.findAllByCompania(companiaCorretajeId);
  }

  async update(id: string, companiaCorretajeId: string, data: UpdateEnteDto): Promise<Ente | null> {
    const existing = await this.enteRepository.findById(id);
    if (!existing) {
      return null;
    }
    if (existing.companiaCorretajeId !== companiaCorretajeId) {
      throw new ApiError('FORBIDDEN', 'No tienes permiso para actualizar este ente.', 403);
    }
    return this.enteRepository.update(id, data as EnteUpdateInput);
  }

  async delete(id: string, companiaCorretajeId: string): Promise<{ message: string }> {
    const existing = await this.enteRepository.findById(id);
    if (!existing) {
      throw new ApiError('ENTE_NOT_FOUND', 'Ente no encontrado para eliminar.', 404);
    }
    if (existing.companiaCorretajeId !== companiaCorretajeId) {
      throw new ApiError('FORBIDDEN', 'No tienes permiso para eliminar este ente.', 403);
    }
    await this.enteRepository.delete(id);
    return { message: 'Ente deleted successfully' };
  }
}
