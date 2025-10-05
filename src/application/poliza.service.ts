import { inject, injectable } from 'inversify';
import { PolizaRepository } from '../domain/ports/polizaRepository.port';
import { TYPES } from '../config/types';
import { Poliza } from '../domain/poliza';

@injectable()
export class PolizaService {
    constructor(
        @inject(TYPES.PolizaRepository) private polizaRepository: PolizaRepository
    ) {}

    public async getAllPolizas(): Promise<Poliza[]> {
        return this.polizaRepository.findAll();
    }

    public async getPolizaById(id: string): Promise<Poliza | null> {
        return this.polizaRepository.findById(id);
    }
}
