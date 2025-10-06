import { inject, injectable } from 'inversify';
import { Poliza } from '../domain/poliza';
import { PolizaRepository, PolizaSearchCriteria } from '../domain/ports/polizaRepository.port';
import { TYPES } from '../config/types';

@injectable()
export class PolizaService {
    constructor(@inject(TYPES.PolizaRepository) private polizaRepository: PolizaRepository) {}

    async getPolizasByCriteria(criteria: PolizaSearchCriteria): Promise<Poliza[]> {
        return this.polizaRepository.findByCriteria(criteria);
    }

    async getPolizaById(id: string, companiaCorretajeId: string): Promise<Poliza | null> {
        return this.polizaRepository.findById(id, companiaCorretajeId);
    }
}
