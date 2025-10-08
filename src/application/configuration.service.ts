
import { inject, injectable } from 'inversify';
import { TYPES } from '../di/types';
import { ConfigurationRepository } from '../domain/ports/configurationRepository.port';
import { Configuration } from '../domain/entities/configuration';
import { ApiError } from '../utils/ApiError';

@injectable()
export class ConfigurationService {
    constructor(
        @inject(TYPES.ConfigurationRepository) private configurationRepository: ConfigurationRepository
    ) {}

    async getAllConfigurations(): Promise<Configuration[]> {
        return this.configurationRepository.findAll();
    }

    async getConfigurationById(id: string): Promise<Configuration> {
        const config = await this.configurationRepository.findById(id);
        if (!config) {
            throw new ApiError('NOT_FOUND', 'Configuración no encontrada.', 404);
        }
        return config;
    }

    async createConfiguration(configuration: Configuration): Promise<Configuration> {
        // Validar que el ID no exista ya
        const existingConfig = await this.configurationRepository.findById(configuration.id);
        if (existingConfig) {
            throw new ApiError('CONFLICT', 'Ya existe una configuración con este ID.', 409);
        }
        return this.configurationRepository.create(configuration);
    }

    async updateConfiguration(id: string, configurationData: Partial<Configuration>): Promise<Configuration> {
        const updatedConfig = await this.configurationRepository.update(id, configurationData);
        if (!updatedConfig) {
            throw new ApiError('NOT_FOUND', 'Configuración no encontrada para actualizar.', 404);
        }
        return updatedConfig;
    }
}
