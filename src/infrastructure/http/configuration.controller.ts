
import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { TYPES } from '../../config/types';
import { ConfigurationService } from '../../application/configuration.service';
import { Configuration } from '../../domain/configuration';
import { handleSuccess } from '../../utils/responseHandler';
import { ApiError } from '../../utils/ApiError';

@injectable()
export class ConfigurationController {
    constructor(
        @inject(TYPES.ConfigurationService) private configurationService: ConfigurationService
    ) {}

    async getAllConfigurations(req: Request, res: Response): Promise<void> {
        const configurations = await this.configurationService.getAllConfigurations();
        handleSuccess(req, res, configurations);
    }

    async getConfigurationById(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const config = await this.configurationService.getConfigurationById(id);
        if (!config) {
            throw new ApiError('NOT_FOUND', `Configuration with id ${id} not found`, 404);
        }
        handleSuccess(req, res, config);
    }

    async createConfiguration(req: Request, res: Response): Promise<void> {
        const configData: Configuration = req.body;
        const newConfig = await this.configurationService.createConfiguration(configData);
        handleSuccess(req, res, newConfig, 201);
    }

    async updateConfiguration(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const configData: Partial<Configuration> = req.body;
        const updatedConfig = await this.configurationService.updateConfiguration(id, configData);
        if (!updatedConfig) {
            throw new ApiError('NOT_FOUND', `Configuration with id ${id} not found`, 404);
        }
        handleSuccess(req, res, updatedConfig);
    }
}
