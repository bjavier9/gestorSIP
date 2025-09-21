import { inject, injectable } from 'inversify';
import { EnteRepository, EnteInput, EnteUpdateInput } from '../domain/ports/enteRepository.port';
import { Ente } from '../domain/ente';
import { TYPES } from '../config/types';
import { ApiError } from '../utils/ApiError'; // Corrected import statement

@injectable()
export class EnteService {
  constructor(
    @inject(TYPES.EnteRepository) private enteRepository: EnteRepository
  ) {}

  async createEnte(data: EnteInput): Promise<Ente> {
    // Additional business logic for creation can go here.
    // For example, checking for duplicate documents before saving.
    const existingEnte = await this.enteRepository.findByDocumento(data.documento);
    if (existingEnte) {
      throw new ApiError('AUTH_USER_ALREADY_EXISTS', 409, 'An ente with this document number already exists.');
    }
    return this.enteRepository.save(data);
  }

  async getEnteById(id: string): Promise<Ente | null> {
    const ente = await this.enteRepository.findById(id);
    if (!ente) {
      throw new ApiError('ENTE_NOT_FOUND', 404, 'Ente not found.');
    }
    return ente;
  }

  async getAllEntes(): Promise<Ente[]> {
    return this.enteRepository.findAll();
  }

  async updateEnte(id: string, data: EnteUpdateInput): Promise<Ente | null> {
    const ente = await this.enteRepository.update(id, data);
    if (!ente) {
      throw new ApiError('ENTE_NOT_FOUND', 404, 'Ente not found for update.');
    }
    return ente;
  }

  async deleteEnte(id: string): Promise<boolean> {
    const success = await this.enteRepository.delete(id);
    if (!success) {
      // This might happen if the ente doesn't exist.
      throw new ApiError('ENTE_NOT_FOUND', 404, 'Ente not found for deletion.');
    }
    return success;
  }
}
