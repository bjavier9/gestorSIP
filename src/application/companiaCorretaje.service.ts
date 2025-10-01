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

  async createCompania(nombre: string, rif: string): Promise<CompaniaCorretaje> {
    // Aquí podrías agregar validaciones, como verificar que el RIF no exista

    const nuevaCompania: CompaniaCorretaje = {
      id: '' /* El ID se generará en la capa de persistencia */,
      nombre,
      rif,
    };

    return this.companiaRepo.create(nuevaCompania);
  }
}
