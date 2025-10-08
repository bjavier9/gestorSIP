
import { injectable, inject } from 'inversify';
import { Aseguradora } from '../domain/entities/aseguradora';
import { AseguradoraRepository } from '../domain/ports/aseguradoraRepository.port';
import { TYPES } from '../di/types';
import { ApiError } from '../utils/ApiError';

@injectable()
export class AseguradoraService {
    constructor(
        @inject(TYPES.AseguradoraRepository) private aseguradoraRepository: AseguradoraRepository
    ) {}

    async createAseguradora(data: Omit<Aseguradora, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Promise<Aseguradora> {
        // Aquí se podrían añadir validaciones de negocio
        return this.aseguradoraRepository.create(data);
    }

    async getAllAseguradoras(): Promise<Aseguradora[]> {
        return this.aseguradoraRepository.findAll();
    }

    async getAseguradoraById(id: string): Promise<Aseguradora> {
        const aseguradora = await this.aseguradoraRepository.findById(id);
        if (!aseguradora) {
            throw new ApiError('NOT_FOUND', 'Aseguradora no encontrada.');
        }
        return aseguradora;
    }

    async updateAseguradora(id: string, updates: Partial<Omit<Aseguradora, 'id' | 'fechaCreacion'>>): Promise<Aseguradora> {
        const updatedAseguradora = await this.aseguradoraRepository.update(id, updates);
        if (!updatedAseguradora) {
            throw new ApiError('NOT_FOUND', 'Aseguradora no encontrada para actualizar.');
        }
        return updatedAseguradora;
    }

    async deactivateAseguradora(id: string): Promise<void> {
        const result = await this.aseguradoraRepository.update(id, { activo: false });
        if (!result) {
            throw new ApiError('NOT_FOUND', 'Aseguradora no encontrada para desactivar.');
        }
    }
}
