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

  async create(data: EnteInput): Promise<Ente> {
    const existingEnte = await this.enteRepository.findByDocumento(data.documento);
    if (existingEnte) {
      throw new ApiError('ENTE_ALREADY_EXISTS', 'An ente with this document number already exists.', 409);
    }
    return this.enteRepository.save(data);
  }

  async getById(id: string): Promise<Ente | null> {
    return this.enteRepository.findById(id);
  }

  async getAll(): Promise<Ente[]> {
    return this.enteRepository.findAll();
  }

  async update(id: string, data: EnteUpdateInput): Promise<Ente | null> {
    return this.enteRepository.update(id, data);
  }

  async delete(id: string): Promise<{ message: string }> {
    await this.enteRepository.delete(id);
    return { message: 'Ente deleted successfully' };
  }
}
