import { inject, injectable } from 'inversify';
import { CompaniaCorretajeRepository } from '../domain/ports/companiaCorretajeRepository.port';
import { TYPES } from '../config/types';
import { CompaniaCorretaje } from '../domain/companiaCorretaje';
import { ApiError } from '../utils/ApiError';

@injectable()
export class CompaniaCorretajeService {
  constructor(
    @inject(TYPES.CompaniaCorretajeRepository) private companiaRepo: CompaniaCorretajeRepository
  ) {}

  async createCompania(companiaData: CompaniaCorretaje): Promise<CompaniaCorretaje> {
    // Aquí podrías agregar validaciones, como verificar que el RIF no exista
    const existingCompania = await this.companiaRepo.findByRif(companiaData.rif);
    if (existingCompania) {
      throw new ApiError('RIF_ALREADY_EXISTS', 'A company with this RIF already exists.', 409);
    }

    return this.companiaRepo.create(companiaData);
  }
}
