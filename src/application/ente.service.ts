import { inject, injectable } from 'inversify';
import { Ente, EnteInput } from '../domain/ente';
import { EnteRepository } from '../domain/ports/enteRepository.port';
import { TYPES } from '../config/types';
import ApiError from '../utils/ApiError';

@injectable()
export class EnteService {
  constructor(
    @inject(TYPES.EnteRepository) private enteRepository: EnteRepository,
  ) {}

  async getAllEntes(): Promise<Ente[]> {
    return this.enteRepository.findAll();
  }

  async getEnteById(id: string): Promise<Ente> {
    const ente = await this.enteRepository.findById(id);
    if (!ente) {
      throw new ApiError('ENTE_NOT_FOUND');
    }
    return ente;
  }

  async createEnte(data:Ente): Promise<Ente> {
    return this.enteRepository.save(data);
  }

  async updateEnte(id: string, data: Partial<EnteInput>):Promise<boolean>   {
    const ente = await this.enteRepository.findById(id);
    if (!ente) {
        throw new ApiError('ENTE_NOT_FOUND');
    }

    const updatedEnte = { ...ente, ...data };

    return this.enteRepository.update(id, updatedEnte);
  }

  async deleteEnte(id: string): Promise<boolean> {
    const ente = await this.enteRepository.findById(id);
    if (!ente) {
        throw new ApiError('ENTE_NOT_FOUND');
    }
    return this.enteRepository.delete(id);
  }
}
