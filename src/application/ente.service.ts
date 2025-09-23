import { inject, injectable } from 'inversify';
import { EnteRepository, EnteInput, EnteUpdateInput } from '../domain/ports/enteRepository.port';
import { Ente } from '../domain/ente';
import { TYPES } from '../config/types';
import { ApiError } from '../utils/ApiError';

@injectable()
export class EnteService {
  constructor(
    @inject(TYPES.EnteRepository) private enteRepository: EnteRepository
  ) {}

  async createEnte(data: EnteInput): Promise<Ente> {
    // The repository now handles checking for existing documents.
    const existingEnte = await this.enteRepository.findByDocumento(data.documento);
    if (existingEnte) {
      throw new ApiError('ENTE_ALREADY_EXISTS', 409, 'An ente with this document number already exists.');
    }
    return this.enteRepository.save(data);
  }

  async getEnteById(id: string): Promise<Ente> {
    const ente = await this.enteRepository.findById(id);
    if (!ente) {
      throw new ApiError('ENTE_NOT_FOUND', 404, 'Ente not found.');
    }
    return ente;
  }

  async getAllEntes(): Promise<Ente[]> {
    return this.enteRepository.findAll();
  }

  async updateEnte(id: string, data: EnteUpdateInput): Promise<Ente> {
    // The repository now handles the not-found case and returns the updated entity.
    const updatedEnte = await this.enteRepository.update(id, data);
    if (!updatedEnte) {
        throw new ApiError('ENTE_NOT_FOUND', 404, 'Ente not found for update.');
    }
    return updatedEnte;
  }

  async deleteEnte(id: string): Promise<void> {
    // The repository now handles the not-found case and throws an error.
    await this.enteRepository.delete(id);
  }
}
