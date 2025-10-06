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
    const existingCompania = await this.companiaRepo.findByRif(companiaData.rif);
    if (existingCompania) {
      throw new ApiError('RIF_ALREADY_EXISTS', 'A company with this RIF already exists.', 409);
    }
    return this.companiaRepo.create(companiaData);
  }

  async getCompaniaById(id: string): Promise<CompaniaCorretaje> {
    const compania = await this.companiaRepo.findById(id);
    if (!compania) {
      throw new ApiError('NOT_FOUND', 'Company not found.', 404);
    }
    return compania;
  }

  async updateCompania(id: string, data: Partial<CompaniaCorretaje>): Promise<CompaniaCorretaje> {
    const existing = await this.companiaRepo.findById(id);
    if (!existing) {
      throw new ApiError('NOT_FOUND', 'Company not found.', 404);
    }
    if (data.rif && data.rif !== existing.rif) {
      const byRif = await this.companiaRepo.findByRif(data.rif);
      if (byRif && byRif.id !== id) {
        throw new ApiError('RIF_ALREADY_EXISTS', 'A company with this RIF already exists.', 409);
      }
    }
    return this.companiaRepo.update(id, { ...data });
  }

  async activarCompania(id: string): Promise<CompaniaCorretaje> {
    const existing = await this.companiaRepo.findById(id);
    if (!existing) {
      throw new ApiError('NOT_FOUND', 'Company not found.', 404);
    }
    return this.companiaRepo.setActive(id, true);
  }

  async desactivarCompania(id: string): Promise<CompaniaCorretaje> {
    const existing = await this.companiaRepo.findById(id);
    if (!existing) {
      throw new ApiError('NOT_FOUND', 'Company not found.', 404);
    }
    return this.companiaRepo.setActive(id, false);
  }
}
